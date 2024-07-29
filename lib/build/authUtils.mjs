import AccountLinking from "./recipe/accountlinking/recipe";
import Session from "./recipe/session";
import MultiTenancy from "./recipe/multitenancy";
import MultiFactorAuth from "./recipe/multifactorauth";
import MultiFactorAuthRecipe from "./recipe/multifactorauth/recipe";
import { updateAndGetMFARelatedInfoInSession } from "./recipe/multifactorauth/utils";
import { isValidFirstFactor } from "./recipe/multitenancy/utils";
import SessionError from "./recipe/session/error";
import { getUser } from ".";
import SessionRecipe from "./recipe/session/recipe";
import { logDebugMessage } from "./logger";
import { EmailVerificationClaim } from "./recipe/emailverification";
import SuperTokensError from "./error";
import { recipeInitDefinedShouldDoAutomaticAccountLinking } from "./recipe/accountlinking/utils";
const AuthUtils = {
  /**
   * This helper function can be used to map error statuses (w/ an optional reason) to error responses with human readable reasons.
   * This maps to a response in the format of `{ status: "3rd param", reason: "human readable string from second param" }`
   *
   * The errorCodeMap is expected to be something like:
   * ```
   * {
   *      EMAIL_VERIFICATION_REQUIRED: "This is returned as reason if the resp(1st param) has the status code EMAIL_VERIFICATION_REQUIRED and an undefined reason",
   *      STATUS: {
   *          REASON: "This is returned as reason if the resp(1st param) has STATUS in the status prop and REASON in the reason prop"
   *      }
   * }
   * ```
   */
  getErrorStatusResponseWithReason(resp, errorCodeMap, errorStatus) {
    const reasons = errorCodeMap[resp.status];
    if (reasons !== void 0) {
      if (typeof reasons === "string") {
        return {
          status: errorStatus,
          reason: reasons
        };
      } else if (typeof reasons === "object" && resp.reason !== void 0) {
        if (reasons[resp.reason]) {
          return {
            status: errorStatus,
            reason: reasons[resp.reason]
          };
        }
      }
    }
    logDebugMessage(`unmapped error status ${resp.status} (${resp.reason})`);
    throw new Error("Should never come here: unmapped error status " + resp.status);
  },
  /**
   * Runs all checks we need to do before trying to authenticate a user:
   * - if this is a first factor auth or not
   * - if the session user is required to be primary (and tries to make it primary if necessary)
   * - if any of the factorids are valid (as first or secondary factors), taking into account mfa factor setup rules
   * - if sign up is allowed (if isSignUp === true)
   *
   * It returns the following statuses:
   * - OK: the auth flow can proceed
   * - SIGN_UP_NOT_ALLOWED: if isSignUpAllowed returned false. This is mostly because of conflicting users with the same account info
   * - LINKING_TO_SESSION_USER_FAILED (SESSION_USER_ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR):
   * if the session user should become primary but we couldn't make it primary because of a conflicting primary user.
   */
  preAuthChecks: async function({
    authenticatingAccountInfo,
    tenantId,
    isSignUp,
    isVerified,
    signInVerifiesLoginMethod,
    authenticatingUser,
    factorIds,
    skipSessionUserUpdateInCore,
    session,
    userContext
  }) {
    let validFactorIds;
    if (factorIds.length === 0) {
      throw new Error("This should never happen: empty factorIds array passed to preSignInChecks");
    }
    logDebugMessage("preAuthChecks checking auth types");
    const authTypeInfo = await AuthUtils.checkAuthTypeAndLinkingStatus(
      session,
      authenticatingAccountInfo,
      authenticatingUser,
      skipSessionUserUpdateInCore,
      userContext
    );
    if (authTypeInfo.status !== "OK") {
      logDebugMessage(`preAuthChecks returning ${authTypeInfo.status} from checkAuthType results`);
      return authTypeInfo;
    }
    if (authTypeInfo.isFirstFactor) {
      logDebugMessage("preAuthChecks getting valid first factors");
      const validFirstFactors = await AuthUtils.filterOutInvalidFirstFactorsOrThrowIfAllAreInvalid(
        factorIds,
        tenantId,
        session !== void 0,
        userContext
      );
      validFactorIds = validFirstFactors;
    } else {
      logDebugMessage("preAuthChecks getting valid secondary factors");
      validFactorIds = await filterOutInvalidSecondFactorsOrThrowIfAllAreInvalid(
        factorIds,
        authTypeInfo.inputUserAlreadyLinkedToSessionUser,
        authTypeInfo.sessionUser,
        session,
        userContext
      );
    }
    if (!isSignUp && authenticatingUser === void 0) {
      throw new Error(
        "This should never happen: preAuthChecks called with isSignUp: false, authenticatingUser: undefined"
      );
    }
    if (isSignUp) {
      let verifiedInSessionUser = !authTypeInfo.isFirstFactor && authTypeInfo.sessionUser.loginMethods.some(
        (lm) => lm.verified && (lm.hasSameEmailAs(authenticatingAccountInfo.email) || lm.hasSamePhoneNumberAs(authenticatingAccountInfo.phoneNumber))
      );
      logDebugMessage("preAuthChecks checking if the user is allowed to sign up");
      if (!await AccountLinking.getInstance().isSignUpAllowed({
        newUser: authenticatingAccountInfo,
        isVerified: isVerified || signInVerifiesLoginMethod || verifiedInSessionUser,
        tenantId,
        session,
        userContext
      })) {
        return { status: "SIGN_UP_NOT_ALLOWED" };
      }
    } else if (authenticatingUser !== void 0) {
      logDebugMessage("preAuthChecks checking if the user is allowed to sign in");
      if (!await AccountLinking.getInstance().isSignInAllowed({
        user: authenticatingUser,
        accountInfo: authenticatingAccountInfo,
        signInVerifiesLoginMethod,
        tenantId,
        session,
        userContext
      })) {
        return { status: "SIGN_IN_NOT_ALLOWED" };
      }
    }
    logDebugMessage("preAuthChecks returning OK");
    return {
      status: "OK",
      validFactorIds,
      isFirstFactor: authTypeInfo.isFirstFactor
    };
  },
  /**
   * Runs the linking process and all check we need to before creating a session + creates the new session if necessary:
   * - runs the linking process which will: try to link to the session user, or link by account info or try to make the authenticated user primary
   * - checks if sign in is allowed (if isSignUp === false)
   * - creates a session if necessary
   * - marks the factor as completed if necessary
   *
   * It returns the following statuses:
   * - OK: the auth flow went as expected
   * - LINKING_TO_SESSION_USER_FAILED(EMAIL_VERIFICATION_REQUIRED): if we couldn't link to the session user because linking requires email verification
   * - LINKING_TO_SESSION_USER_FAILED(RECIPE_USER_ID_ALREADY_LINKED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR):
   * if we couldn't link to the session user because the authenticated user has been linked to another primary user concurrently
   * - LINKING_TO_SESSION_USER_FAILED(ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR):
   * if we couldn't link to the session user because of a conflicting primary user that has the same account info as authenticatedUser
   * - LINKING_TO_SESSION_USER_FAILED (SESSION_USER_ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR):
   * if the session user should be primary but we couldn't make it primary because of a conflicting primary user.
   */
  postAuthChecks: async function({
    authenticatedUser,
    recipeUserId,
    isSignUp,
    factorId,
    session,
    req,
    res,
    tenantId,
    userContext
  }) {
    logDebugMessage(
      `postAuthChecks called ${session !== void 0 ? "with" : "without"} a session to ${isSignUp ? "sign in" : "sign up"} with ${factorId}`
    );
    const mfaInstance = MultiFactorAuthRecipe.getInstance();
    let respSession = session;
    if (session !== void 0) {
      const authenticatedUserLinkedToSessionUser = authenticatedUser.loginMethods.some(
        (lm) => lm.recipeUserId.getAsString() === session.getRecipeUserId(userContext).getAsString()
      );
      if (authenticatedUserLinkedToSessionUser) {
        logDebugMessage(`postAuthChecks session and input user got linked`);
        if (mfaInstance !== void 0) {
          logDebugMessage(`postAuthChecks marking factor as completed`);
          await MultiFactorAuth.markFactorAsCompleteInSession(respSession, factorId, userContext);
        }
      } else {
        logDebugMessage(`postAuthChecks checking overwriteSessionDuringSignInUp`);
        let overwriteSessionDuringSignInUp = SessionRecipe.getInstanceOrThrowError().config.overwriteSessionDuringSignInUp;
        if (overwriteSessionDuringSignInUp) {
          respSession = await Session.createNewSession(req, res, tenantId, recipeUserId, {}, {}, userContext);
          if (mfaInstance !== void 0) {
            await MultiFactorAuth.markFactorAsCompleteInSession(respSession, factorId, userContext);
          }
        }
      }
    } else {
      logDebugMessage(`postAuthChecks creating session for first factor sign in/up`);
      respSession = await Session.createNewSession(req, res, tenantId, recipeUserId, {}, {}, userContext);
      if (mfaInstance !== void 0) {
        await MultiFactorAuth.markFactorAsCompleteInSession(respSession, factorId, userContext);
      }
    }
    return { status: "OK", session: respSession, user: authenticatedUser };
  },
  /**
   * This function tries to find the authenticating user (we use this information to see if the current auth is sign in or up)
   * if a session was passed and the authenticating user was not found on the current tenant, it checks if the session user
   * has a matching login method on other tenants. If it does and the credentials check out on the other tenant, it associates
   * the recipe user for the login method (matching account info, recipeId and credentials) with the current tenant.
   *
   * While this initially complicates the auth logic, we want to avoid creating a new recipe user if a tenant association will do,
   * because it'll make managing MFA factors (i.e.: secondary passwords) a lot easier for the app, and,
   * most importantly, this way all secondary factors are app-wide instead of mixing app-wide (totp) and tenant-wide (password) factors.
   */
  getAuthenticatingUserAndAddToCurrentTenantIfRequired: async ({
    recipeId,
    accountInfo,
    checkCredentialsOnTenant,
    tenantId,
    session,
    userContext
  }) => {
    let i = 0;
    while (i++ < 300) {
      logDebugMessage(
        `getAuthenticatingUserAndAddToCurrentTenantIfRequired called with ${JSON.stringify(accountInfo)}`
      );
      const existingUsers = await AccountLinking.getInstance().recipeInterfaceImpl.listUsersByAccountInfo({
        tenantId,
        accountInfo,
        doUnionOfAccountInfo: true,
        userContext
      });
      logDebugMessage(
        `getAuthenticatingUserAndAddToCurrentTenantIfRequired got ${existingUsers.length} users from the core resp`
      );
      const usersWithMatchingLoginMethods = existingUsers.map((user) => ({
        user,
        loginMethod: user.loginMethods.find(
          (lm) => lm.recipeId === recipeId && (accountInfo.email !== void 0 && lm.hasSameEmailAs(accountInfo.email) || lm.hasSamePhoneNumberAs(accountInfo.phoneNumber) || lm.hasSameThirdPartyInfoAs(accountInfo.thirdParty))
        )
      })).filter(({ loginMethod }) => loginMethod !== void 0);
      logDebugMessage(
        `getAuthenticatingUserAndAddToCurrentTenantIfRequired got ${usersWithMatchingLoginMethods.length} users with matching login methods`
      );
      if (usersWithMatchingLoginMethods.length > 1) {
        throw new Error(
          "You have found a bug. Please report it on https://github.com/supertokens/supertokens-node/issues"
        );
      }
      let authenticatingUser = usersWithMatchingLoginMethods[0];
      if (authenticatingUser === void 0 && session !== void 0) {
        logDebugMessage(`getAuthenticatingUserAndAddToCurrentTenantIfRequired checking session user`);
        const sessionUser = await getUser(session.getUserId(userContext), userContext);
        if (sessionUser === void 0) {
          throw new SessionError({
            type: SessionError.UNAUTHORISED,
            message: "Session user not found"
          });
        }
        if (!sessionUser.isPrimaryUser) {
          logDebugMessage(
            `getAuthenticatingUserAndAddToCurrentTenantIfRequired session user is non-primary so returning early without checking other tenants`
          );
          return void 0;
        }
        const matchingLoginMethodsFromSessionUser = sessionUser.loginMethods.filter(
          (lm) => lm.recipeId === recipeId && (lm.hasSameEmailAs(accountInfo.email) || lm.hasSamePhoneNumberAs(accountInfo.phoneNumber) || lm.hasSameThirdPartyInfoAs(accountInfo.thirdParty))
        );
        logDebugMessage(
          `getAuthenticatingUserAndAddToCurrentTenantIfRequired session has ${matchingLoginMethodsFromSessionUser.length} matching login methods`
        );
        if (matchingLoginMethodsFromSessionUser.some((lm) => lm.tenantIds.includes(tenantId))) {
          logDebugMessage(
            `getAuthenticatingUserAndAddToCurrentTenantIfRequired session has ${matchingLoginMethodsFromSessionUser.length} matching login methods`
          );
          return {
            user: sessionUser,
            loginMethod: matchingLoginMethodsFromSessionUser.find((lm) => lm.tenantIds.includes(tenantId))
          };
        }
        let goToRetry = false;
        for (const lm of matchingLoginMethodsFromSessionUser) {
          logDebugMessage(
            `getAuthenticatingUserAndAddToCurrentTenantIfRequired session checking credentials on ${lm.tenantIds[0]}`
          );
          if (await checkCredentialsOnTenant(lm.tenantIds[0])) {
            logDebugMessage(
              `getAuthenticatingUserAndAddToCurrentTenantIfRequired associating user from ${lm.tenantIds[0]} with current tenant`
            );
            const associateRes = await MultiTenancy.associateUserToTenant(
              tenantId,
              lm.recipeUserId,
              userContext
            );
            logDebugMessage(
              `getAuthenticatingUserAndAddToCurrentTenantIfRequired associating returned ${associateRes.status}`
            );
            if (associateRes.status === "OK") {
              lm.tenantIds.push(tenantId);
              return { user: sessionUser, loginMethod: lm };
            }
            if (associateRes.status === "UNKNOWN_USER_ID_ERROR" || // This means that the recipe user was deleted
            // All below conditions mean that both the account list and the session user we loaded is outdated
            associateRes.status === "EMAIL_ALREADY_EXISTS_ERROR" || associateRes.status === "PHONE_NUMBER_ALREADY_EXISTS_ERROR" || associateRes.status === "THIRD_PARTY_USER_ALREADY_EXISTS_ERROR") {
              goToRetry = true;
              break;
            }
            if (associateRes.status === "ASSOCIATION_NOT_ALLOWED_ERROR") {
              throw new SessionError({
                type: SessionError.UNAUTHORISED,
                message: "Session user not associated with the session tenant"
              });
            }
          }
        }
        if (goToRetry) {
          logDebugMessage(`getAuthenticatingUserAndAddToCurrentTenantIfRequired retrying`);
          continue;
        }
      }
      return authenticatingUser;
    }
    throw new Error(
      "This should never happen: ran out of retries for getAuthenticatingUserAndAddToCurrentTenantIfRequired"
    );
  },
  /**
   * This function checks if the current authentication attempt should be considered a first factor or not.
   * To do this it'll also need to (if a session was passed):
   * - load the session user (and possibly make it primary)
   * - check the linking status of the input and session user
   * - call and check the results of shouldDoAutomaticAccountLinking
   * So in the non-first factor case it also returns the results of those checks/operations.
   *
   * It returns the following statuses:
   * - OK: if everything went well
   * - LINKING_TO_SESSION_USER_FAILED (SESSION_USER_ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR):
   * if the session user should be primary but we couldn't make it primary because of a conflicting primary user.
   */
  checkAuthTypeAndLinkingStatus: async function(session, accountInfo, inputUser, skipSessionUserUpdateInCore, userContext) {
    logDebugMessage(`checkAuthTypeAndLinkingStatus called`);
    let sessionUser = void 0;
    if (session === void 0) {
      logDebugMessage(`checkAuthTypeAndLinkingStatus returning first factor because there is no session`);
      return { status: "OK", isFirstFactor: true };
    } else {
      if (!recipeInitDefinedShouldDoAutomaticAccountLinking(AccountLinking.getInstance().config)) {
        if (MultiFactorAuthRecipe.getInstance() !== void 0) {
          throw new Error(
            "Please initialise the account linking recipe and define shouldDoAutomaticAccountLinking to enable MFA"
          );
        } else {
          return { status: "OK", isFirstFactor: true };
        }
      }
      if (inputUser !== void 0 && inputUser.id === session.getUserId()) {
        logDebugMessage(
          `checkAuthTypeAndLinkingStatus returning secondary factor, session and input user are the same`
        );
        return {
          status: "OK",
          isFirstFactor: false,
          inputUserAlreadyLinkedToSessionUser: true,
          sessionUser: inputUser
        };
      }
      logDebugMessage(
        `checkAuthTypeAndLinkingStatus loading session user, ${inputUser == null ? void 0 : inputUser.id} === ${session.getUserId()}`
      );
      const sessionUserResult = await AuthUtils.tryAndMakeSessionUserIntoAPrimaryUser(
        session,
        skipSessionUserUpdateInCore,
        userContext
      );
      if (sessionUserResult.status === "SHOULD_AUTOMATICALLY_LINK_FALSE") {
        return {
          status: "OK",
          isFirstFactor: true
        };
      } else if (sessionUserResult.status === "ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR") {
        return {
          status: "LINKING_TO_SESSION_USER_FAILED",
          reason: "SESSION_USER_ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR"
        };
      }
      sessionUser = sessionUserResult.sessionUser;
      const shouldLink = await AccountLinking.getInstance().config.shouldDoAutomaticAccountLinking(
        accountInfo,
        sessionUser,
        session,
        session.getTenantId(),
        userContext
      );
      logDebugMessage(
        `checkAuthTypeAndLinkingStatus session user <-> input user shouldDoAutomaticAccountLinking returned ${JSON.stringify(
          shouldLink
        )}`
      );
      if (shouldLink.shouldAutomaticallyLink === false) {
        return { status: "OK", isFirstFactor: true };
      } else {
        return {
          status: "OK",
          isFirstFactor: false,
          inputUserAlreadyLinkedToSessionUser: false,
          sessionUser,
          linkingToSessionUserRequiresVerification: shouldLink.shouldRequireVerification
        };
      }
    }
  },
  /**
   * This function checks the auth type (first factor or not), links by account info for first factor auths otherwise
   * it tries to link the input user to the session user
   *
   * It returns the following statuses:
   * - OK: the linking went as expected
   * - LINKING_TO_SESSION_USER_FAILED(EMAIL_VERIFICATION_REQUIRED): if we couldn't link to the session user because linking requires email verification
   * - LINKING_TO_SESSION_USER_FAILED(RECIPE_USER_ID_ALREADY_LINKED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR):
   * if we couldn't link to the session user because the authenticated user has been linked to another primary user concurrently
   * - LINKING_TO_SESSION_USER_FAILED(ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR):
   * if we couldn't link to the session user because of a conflicting primary user that has the same account info as authenticatedUser
   * - LINKING_TO_SESSION_USER_FAILED (SESSION_USER_ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR):
   * if the session user should be primary but we couldn't make it primary because of a conflicting primary user.
   */
  linkToSessionIfProvidedElseCreatePrimaryUserIdOrLinkByAccountInfo: async function({
    tenantId,
    inputUser,
    recipeUserId,
    session,
    userContext
  }) {
    logDebugMessage("linkToSessionIfProvidedElseCreatePrimaryUserIdOrLinkByAccountInfo called");
    const retry = () => {
      logDebugMessage("linkToSessionIfProvidedElseCreatePrimaryUserIdOrLinkByAccountInfo retrying....");
      return AuthUtils.linkToSessionIfProvidedElseCreatePrimaryUserIdOrLinkByAccountInfo({
        tenantId,
        inputUser,
        session,
        recipeUserId,
        userContext
      });
    };
    const authLoginMethod = inputUser.loginMethods.find(
      (lm) => lm.recipeUserId.getAsString() === recipeUserId.getAsString()
    );
    if (authLoginMethod === void 0) {
      throw new Error(
        "This should never happen: the recipeUserId and user is inconsistent in createPrimaryUserIdOrLinkByAccountInfo params"
      );
    }
    const authTypeRes = await AuthUtils.checkAuthTypeAndLinkingStatus(
      session,
      authLoginMethod,
      inputUser,
      false,
      userContext
    );
    if (authTypeRes.status !== "OK") {
      return authTypeRes;
    }
    if (authTypeRes.isFirstFactor) {
      if (!recipeInitDefinedShouldDoAutomaticAccountLinking(AccountLinking.getInstance().config)) {
        logDebugMessage(
          "linkToSessionIfProvidedElseCreatePrimaryUserIdOrLinkByAccountInfo skipping link by account info because this is a first factor auth and the app hasn't defined shouldDoAutomaticAccountLinking"
        );
        return { status: "OK", user: inputUser };
      }
      logDebugMessage(
        "linkToSessionIfProvidedElseCreatePrimaryUserIdOrLinkByAccountInfo trying to link by account info because this is a first factor auth"
      );
      const linkRes = await AccountLinking.getInstance().tryLinkingByAccountInfoOrCreatePrimaryUser({
        inputUser,
        session,
        tenantId,
        userContext
      });
      if (linkRes.status === "OK") {
        return { status: "OK", user: linkRes.user };
      }
      if (linkRes.status === "NO_LINK") {
        return { status: "OK", user: inputUser };
      }
      return retry();
    }
    if (authTypeRes.inputUserAlreadyLinkedToSessionUser) {
      return {
        status: "OK",
        user: authTypeRes.sessionUser
      };
    }
    logDebugMessage(
      "linkToSessionIfProvidedElseCreatePrimaryUserIdOrLinkByAccountInfo trying to link by session info"
    );
    const sessionLinkingRes = await AuthUtils.tryLinkingBySession({
      sessionUser: authTypeRes.sessionUser,
      authenticatedUser: inputUser,
      authLoginMethod,
      linkingToSessionUserRequiresVerification: authTypeRes.linkingToSessionUserRequiresVerification,
      userContext
    });
    if (sessionLinkingRes.status === "LINKING_TO_SESSION_USER_FAILED") {
      if (sessionLinkingRes.reason === "INPUT_USER_IS_NOT_A_PRIMARY_USER") {
        return retry();
      } else {
        return sessionLinkingRes;
      }
    } else {
      return sessionLinkingRes;
    }
  },
  /**
   * This function loads the session user and tries to make it primary.
   * It returns:
   * - OK: if the session user was a primary user or we made it into one or it can/should become one but `skipSessionUserUpdateInCore` is set to true
   * - SHOULD_AUTOMATICALLY_LINK_FALSE: if shouldDoAutomaticAccountLinking returned `{ shouldAutomaticallyLink: false }`
   * - ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR:
   * If we tried to make it into a primary user but it didn't succeed because of a conflicting primary user
   *
   * It throws INVALID_CLAIM_ERROR if shouldDoAutomaticAccountLinking returned `{ shouldAutomaticallyLink: false }` but the email verification status was wrong
   */
  tryAndMakeSessionUserIntoAPrimaryUser: async function(session, skipSessionUserUpdateInCore, userContext) {
    logDebugMessage(`tryAndMakeSessionUserIntoAPrimaryUser called`);
    const sessionUser = await getUser(session.getUserId(), userContext);
    if (sessionUser === void 0) {
      throw new SessionError({
        type: SessionError.UNAUTHORISED,
        message: "Session user not found"
      });
    }
    if (sessionUser.isPrimaryUser) {
      logDebugMessage(`tryAndMakeSessionUserIntoAPrimaryUser session user already primary`);
      return { status: "OK", sessionUser };
    } else {
      logDebugMessage(`tryAndMakeSessionUserIntoAPrimaryUser not primary user yet`);
      const shouldDoAccountLinking = await AccountLinking.getInstance().config.shouldDoAutomaticAccountLinking(
        sessionUser.loginMethods[0],
        void 0,
        session,
        session.getTenantId(userContext),
        userContext
      );
      logDebugMessage(
        `tryAndMakeSessionUserIntoAPrimaryUser shouldDoAccountLinking: ${JSON.stringify(
          shouldDoAccountLinking
        )}`
      );
      if (shouldDoAccountLinking.shouldAutomaticallyLink) {
        if (skipSessionUserUpdateInCore) {
          return { status: "OK", sessionUser };
        }
        if (shouldDoAccountLinking.shouldRequireVerification && !sessionUser.loginMethods[0].verified) {
          if (await session.getClaimValue(EmailVerificationClaim, userContext) !== false) {
            logDebugMessage(
              `tryAndMakeSessionUserIntoAPrimaryUser updating emailverification status in session`
            );
            await session.setClaimValue(EmailVerificationClaim, false, userContext);
          }
          logDebugMessage(`tryAndMakeSessionUserIntoAPrimaryUser throwing validation error`);
          await session.assertClaims([EmailVerificationClaim.validators.isVerified()], userContext);
          throw new Error(
            "This should never happen: email verification claim validator passed after setting value to false"
          );
        }
        const createPrimaryUserRes = await AccountLinking.getInstance().recipeInterfaceImpl.createPrimaryUser({
          recipeUserId: sessionUser.loginMethods[0].recipeUserId,
          userContext
        });
        logDebugMessage(
          `tryAndMakeSessionUserIntoAPrimaryUser createPrimaryUser returned ${createPrimaryUserRes.status}`
        );
        if (createPrimaryUserRes.status === "RECIPE_USER_ID_ALREADY_LINKED_WITH_PRIMARY_USER_ID_ERROR") {
          throw new SessionError({
            type: SessionError.UNAUTHORISED,
            message: "Session user not found"
          });
        } else if (createPrimaryUserRes.status === "OK") {
          return { status: "OK", sessionUser: createPrimaryUserRes.user };
        } else {
          return createPrimaryUserRes;
        }
      } else {
        return { status: "SHOULD_AUTOMATICALLY_LINK_FALSE" };
      }
    }
  },
  /**
   * This function tries linking by session, and doesn't attempt to make the authenticated user a primary or link it by account info
   *
   * It returns the following statuses:
   * - OK: the linking went as expected
   * - LINKING_TO_SESSION_USER_FAILED(EMAIL_VERIFICATION_REQUIRED): if we couldn't link to the session user because linking requires email verification
   * - LINKING_TO_SESSION_USER_FAILED(RECIPE_USER_ID_ALREADY_LINKED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR):
   * if we couldn't link to the session user because the authenticated user has been linked to another primary user concurrently
   * - LINKING_TO_SESSION_USER_FAILED(ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR):
   * if we couldn't link to the session user because of a conflicting primary user that has the same account info as authenticatedUser
   * - LINKING_TO_SESSION_USER_FAILED (INPUT_USER_IS_NOT_A_PRIMARY_USER):
   * if the session user is not primary. This can be resolved by making it primary and retrying the call.
   */
  tryLinkingBySession: async function({
    linkingToSessionUserRequiresVerification,
    authLoginMethod,
    authenticatedUser,
    sessionUser,
    userContext
  }) {
    logDebugMessage("tryLinkingBySession called");
    const sessionUserHasVerifiedAccountInfo = sessionUser.loginMethods.some(
      (lm) => (lm.hasSameEmailAs(authLoginMethod.email) || lm.hasSamePhoneNumberAs(authLoginMethod.phoneNumber)) && lm.verified
    );
    const canLinkBasedOnVerification = !linkingToSessionUserRequiresVerification || authLoginMethod.verified || sessionUserHasVerifiedAccountInfo;
    if (!canLinkBasedOnVerification) {
      return { status: "LINKING_TO_SESSION_USER_FAILED", reason: "EMAIL_VERIFICATION_REQUIRED" };
    }
    let linkAccountsResult = await AccountLinking.getInstance().recipeInterfaceImpl.linkAccounts({
      recipeUserId: authenticatedUser.loginMethods[0].recipeUserId,
      primaryUserId: sessionUser.id,
      userContext
    });
    if (linkAccountsResult.status === "OK") {
      logDebugMessage("tryLinkingBySession successfully linked input user to session user");
      return { status: "OK", user: linkAccountsResult.user };
    } else if (linkAccountsResult.status === "RECIPE_USER_ID_ALREADY_LINKED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR") {
      logDebugMessage(
        "tryLinkingBySession linking to session user failed because of a race condition - input user linked to another user"
      );
      return { status: "LINKING_TO_SESSION_USER_FAILED", reason: linkAccountsResult.status };
    } else if (linkAccountsResult.status === "INPUT_USER_IS_NOT_A_PRIMARY_USER") {
      logDebugMessage(
        "tryLinkingBySession linking to session user failed because of a race condition - INPUT_USER_IS_NOT_A_PRIMARY_USER, should retry"
      );
      return { status: "LINKING_TO_SESSION_USER_FAILED", reason: linkAccountsResult.status };
    } else {
      logDebugMessage(
        "tryLinkingBySession linking to session user failed because of a race condition - input user has another primary user it can be linked to"
      );
      return { status: "LINKING_TO_SESSION_USER_FAILED", reason: linkAccountsResult.status };
    }
  },
  filterOutInvalidFirstFactorsOrThrowIfAllAreInvalid: async function(factorIds, tenantId, hasSession, userContext) {
    let validFactorIds = [];
    for (const id of factorIds) {
      let validRes = await isValidFirstFactor(tenantId, id, userContext);
      if (validRes.status === "TENANT_NOT_FOUND_ERROR") {
        if (hasSession) {
          throw new SessionError({
            type: SessionError.UNAUTHORISED,
            message: "Tenant not found"
          });
        } else {
          throw new Error("Tenant not found error.");
        }
      } else if (validRes.status === "OK") {
        validFactorIds.push(id);
      }
    }
    if (validFactorIds.length === 0) {
      if (!hasSession) {
        throw new SessionError({
          type: SessionError.UNAUTHORISED,
          message: "A valid session is required to authenticate with secondary factors"
        });
      } else {
        throw new SuperTokensError({
          type: SuperTokensError.BAD_INPUT_ERROR,
          message: "First factor sign in/up called for a non-first factor with an active session. This might indicate that you are trying to use this as a secondary factor, but disabled account linking."
        });
      }
    }
    return validFactorIds;
  }
};
async function filterOutInvalidSecondFactorsOrThrowIfAllAreInvalid(factorIds, inputUserAlreadyLinkedToSessionUser, sessionUser, session, userContext) {
  if (session === void 0) {
    throw new Error(
      "This should never happen: filterOutInvalidSecondFactorsOrThrowIfAllAreInvalid called without a session"
    );
  }
  if (sessionUser === void 0) {
    throw new Error(
      "This should never happen: filterOutInvalidSecondFactorsOrThrowIfAllAreInvalid called without a sessionUser"
    );
  }
  logDebugMessage(`filterOutInvalidSecondFactorsOrThrowIfAllAreInvalid called for ${factorIds.join(", ")}`);
  const mfaInstance = MultiFactorAuthRecipe.getInstance();
  if (mfaInstance !== void 0) {
    if (!inputUserAlreadyLinkedToSessionUser) {
      let factorsSetUpForUserProm;
      let mfaInfoProm;
      const memoizedAllowedToSetupFactorInput = {
        factorId: "placeholder",
        // This is updated inside the loop
        session,
        get factorsSetUpForUser() {
          if (factorsSetUpForUserProm) {
            return factorsSetUpForUserProm;
          }
          factorsSetUpForUserProm = mfaInstance.recipeInterfaceImpl.getFactorsSetupForUser({
            user: sessionUser,
            userContext
          });
          return factorsSetUpForUserProm;
        },
        get mfaRequirementsForAuth() {
          if (mfaInfoProm) {
            return mfaInfoProm.then((res) => res.mfaRequirementsForAuth);
          }
          mfaInfoProm = updateAndGetMFARelatedInfoInSession({
            session,
            userContext
          });
          return mfaInfoProm.then((res) => res.mfaRequirementsForAuth);
        },
        userContext
      };
      logDebugMessage(
        `filterOutInvalidSecondFactorsOrThrowIfAllAreInvalid checking if linking is allowed by the mfa recipe`
      );
      let caughtSetupFactorError;
      const validFactorIds = [];
      for (const id of factorIds) {
        logDebugMessage(
          `filterOutInvalidSecondFactorsOrThrowIfAllAreInvalid checking assertAllowedToSetupFactorElseThrowInvalidClaimError`
        );
        try {
          memoizedAllowedToSetupFactorInput.factorId = id;
          await mfaInstance.recipeInterfaceImpl.assertAllowedToSetupFactorElseThrowInvalidClaimError(
            memoizedAllowedToSetupFactorInput
          );
          logDebugMessage(
            `filterOutInvalidSecondFactorsOrThrowIfAllAreInvalid ${id} valid because assertAllowedToSetupFactorElseThrowInvalidClaimError passed`
          );
          validFactorIds.push(id);
        } catch (err) {
          logDebugMessage(
            `filterOutInvalidSecondFactorsOrThrowIfAllAreInvalid assertAllowedToSetupFactorElseThrowInvalidClaimError failed for ${id}`
          );
          caughtSetupFactorError = err;
        }
      }
      if (validFactorIds.length === 0) {
        logDebugMessage(
          `filterOutInvalidSecondFactorsOrThrowIfAllAreInvalid rethrowing error from assertAllowedToSetupFactorElseThrowInvalidClaimError because we found no valid factors`
        );
        throw caughtSetupFactorError;
      }
      return validFactorIds;
    } else {
      logDebugMessage(
        `filterOutInvalidSecondFactorsOrThrowIfAllAreInvalid allowing all factors because it'll not create new link`
      );
      return factorIds;
    }
  } else {
    logDebugMessage(
      `filterOutInvalidSecondFactorsOrThrowIfAllAreInvalid allowing all factors because MFA is not enabled`
    );
    return factorIds;
  }
}
export {
  AuthUtils
};
