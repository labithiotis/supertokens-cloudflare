import RecipeModule from "../../recipeModule";
import { validateAndNormaliseUserInput } from "./utils";
import OverrideableBuilder from "supertokens-js-override";
import RecipeImplementation from "./recipeImplementation";
import { Querier } from "../../querier";
import SuperTokensError from "../../error";
import supertokens from "../../supertokens";
import { ProcessState, PROCESS_STATE } from "../../processState";
import { logDebugMessage } from "../../logger";
import EmailVerificationRecipe from "../emailverification/recipe";
import { env } from "node:process";
const _Recipe = class _Recipe extends RecipeModule {
  constructor(recipeId, appInfo, config, _recipes, _ingredients) {
    super(recipeId, appInfo);
    this.getPrimaryUserThatCanBeLinkedToRecipeUserId = async ({
      tenantId,
      user,
      userContext
    }) => {
      if (user.isPrimaryUser) {
        return user;
      }
      let users = await this.recipeInterfaceImpl.listUsersByAccountInfo({
        tenantId,
        accountInfo: user.loginMethods[0],
        doUnionOfAccountInfo: true,
        userContext
      });
      logDebugMessage(`getPrimaryUserThatCanBeLinkedToRecipeUserId found ${users.length} matching users`);
      let pUsers = users.filter((u) => u.isPrimaryUser);
      logDebugMessage(`getPrimaryUserThatCanBeLinkedToRecipeUserId found ${pUsers.length} matching primary users`);
      if (pUsers.length > 1) {
        throw new Error("You found a bug. Please report it on github.com/supertokens/supertokens-node");
      }
      return pUsers.length === 0 ? void 0 : pUsers[0];
    };
    this.getOldestUserThatCanBeLinkedToRecipeUser = async ({
      tenantId,
      user,
      userContext
    }) => {
      if (user.isPrimaryUser) {
        return user;
      }
      let users = await this.recipeInterfaceImpl.listUsersByAccountInfo({
        tenantId,
        accountInfo: user.loginMethods[0],
        doUnionOfAccountInfo: true,
        userContext
      });
      logDebugMessage(`getOldestUserThatCanBeLinkedToRecipeUser found ${users.length} matching users`);
      const oldestUser = users.length === 0 ? void 0 : users.reduce((min, curr) => min.timeJoined < curr.timeJoined ? min : curr);
      return oldestUser;
    };
    this.isSignInAllowed = async ({
      user,
      accountInfo,
      tenantId,
      session,
      signInVerifiesLoginMethod,
      userContext
    }) => {
      ProcessState.getInstance().addState(PROCESS_STATE.IS_SIGN_IN_ALLOWED_CALLED);
      if (user.isPrimaryUser || user.loginMethods[0].verified || signInVerifiesLoginMethod) {
        return true;
      }
      return this.isSignInUpAllowedHelper({
        accountInfo,
        isVerified: user.loginMethods[0].verified,
        session,
        tenantId,
        isSignIn: true,
        user,
        userContext
      });
    };
    this.isSignUpAllowed = async ({
      newUser,
      isVerified,
      session,
      tenantId,
      userContext
    }) => {
      ProcessState.getInstance().addState(PROCESS_STATE.IS_SIGN_UP_ALLOWED_CALLED);
      if (newUser.email !== void 0 && newUser.phoneNumber !== void 0) {
        throw new Error("Please pass one of email or phone number, not both");
      }
      return this.isSignInUpAllowedHelper({
        accountInfo: newUser,
        isVerified,
        session,
        tenantId,
        userContext,
        user: void 0,
        isSignIn: false
      });
    };
    this.isSignInUpAllowedHelper = async ({
      accountInfo,
      isVerified,
      session,
      tenantId,
      isSignIn,
      user,
      userContext
    }) => {
      ProcessState.getInstance().addState(PROCESS_STATE.IS_SIGN_IN_UP_ALLOWED_HELPER_CALLED);
      let users = await this.recipeInterfaceImpl.listUsersByAccountInfo({
        tenantId,
        accountInfo,
        doUnionOfAccountInfo: true,
        userContext
      });
      if (users.length === 0) {
        logDebugMessage("isSignInUpAllowedHelper returning true because no user with given account info");
        return true;
      }
      if (isSignIn && user === void 0) {
        throw new Error(
          "This should never happen: isSignInUpAllowedHelper called with isSignIn: true, user: undefined"
        );
      }
      if (users.length === 1 && isSignIn && user !== void 0 && users[0].id === user.id) {
        logDebugMessage(
          "isSignInUpAllowedHelper returning true because this is sign in and there is only a single user with the given account info"
        );
        return true;
      }
      const primaryUsers = users.filter((u) => u.isPrimaryUser);
      if (primaryUsers.length === 0) {
        logDebugMessage("isSignInUpAllowedHelper no primary user exists");
        let shouldDoAccountLinking = await this.config.shouldDoAutomaticAccountLinking(
          accountInfo,
          void 0,
          session,
          tenantId,
          userContext
        );
        if (!shouldDoAccountLinking.shouldAutomaticallyLink) {
          logDebugMessage("isSignInUpAllowedHelper returning true because account linking is disabled");
          return true;
        }
        if (!shouldDoAccountLinking.shouldRequireVerification) {
          logDebugMessage(
            "isSignInUpAllowedHelper returning true because dec does not require email verification"
          );
          return true;
        }
        let shouldAllow = true;
        for (let i = 0; i < users.length; i++) {
          let currUser = users[i];
          if (session !== void 0 && currUser.id === session.getUserId(userContext)) {
            continue;
          }
          let thisIterationIsVerified = false;
          if (accountInfo.email !== void 0) {
            if (currUser.loginMethods[0].hasSameEmailAs(accountInfo.email) && currUser.loginMethods[0].verified) {
              logDebugMessage("isSignInUpAllowedHelper found same email for another user and verified");
              thisIterationIsVerified = true;
            }
          }
          if (accountInfo.phoneNumber !== void 0) {
            if (currUser.loginMethods[0].hasSamePhoneNumberAs(accountInfo.phoneNumber) && currUser.loginMethods[0].verified) {
              logDebugMessage(
                "isSignInUpAllowedHelper found same phone number for another user and verified"
              );
              thisIterationIsVerified = true;
            }
          }
          if (!thisIterationIsVerified) {
            logDebugMessage(
              "isSignInUpAllowedHelper returning false cause one of the other recipe level users is not verified"
            );
            shouldAllow = false;
            break;
          }
        }
        ProcessState.getInstance().addState(PROCESS_STATE.IS_SIGN_IN_UP_ALLOWED_NO_PRIMARY_USER_EXISTS);
        logDebugMessage("isSignInUpAllowedHelper returning " + shouldAllow);
        return shouldAllow;
      } else {
        if (primaryUsers.length > 1) {
          throw new Error(
            "You have found a bug. Please report to https://github.com/supertokens/supertokens-node/issues"
          );
        }
        let primaryUser = primaryUsers[0];
        logDebugMessage("isSignInUpAllowedHelper primary user found");
        let shouldDoAccountLinking = await this.config.shouldDoAutomaticAccountLinking(
          accountInfo,
          primaryUser,
          session,
          tenantId,
          userContext
        );
        if (!shouldDoAccountLinking.shouldAutomaticallyLink) {
          logDebugMessage("isSignInUpAllowedHelper returning true because account linking is disabled");
          return true;
        }
        if (!shouldDoAccountLinking.shouldRequireVerification) {
          logDebugMessage(
            "isSignInUpAllowedHelper returning true because dec does not require email verification"
          );
          return true;
        }
        if (!isVerified) {
          logDebugMessage(
            "isSignInUpAllowedHelper returning false because new user's email is not verified, and primary user with the same email was found."
          );
          return false;
        }
        if (session !== void 0 && primaryUser.id === session.getUserId()) {
          return true;
        }
        for (let i = 0; i < primaryUser.loginMethods.length; i++) {
          let lM = primaryUser.loginMethods[i];
          if (lM.email !== void 0) {
            if (lM.hasSameEmailAs(accountInfo.email) && lM.verified) {
              logDebugMessage(
                "isSignInUpAllowedHelper returning true cause found same email for primary user and verified"
              );
              return true;
            }
          }
          if (lM.phoneNumber !== void 0) {
            if (lM.hasSamePhoneNumberAs(accountInfo.phoneNumber) && lM.verified) {
              logDebugMessage(
                "isSignInUpAllowedHelper returning true cause found same phone number for primary user and verified"
              );
              return true;
            }
          }
        }
        logDebugMessage(
          "isSignInUpAllowedHelper returning false cause primary user does not have the same email or phone number that is verified"
          //"isSignInUpAllowedHelper returning false because new user's email is not verified, and primary user with the same email was found."
        );
        return false;
      }
    };
    this.isEmailChangeAllowed = async (input) => {
      let inputUser = input.user;
      if (inputUser === void 0) {
        throw new Error("Passed in recipe user id does not exist");
      }
      for (const tenantId of inputUser.tenantIds) {
        let existingUsersWithNewEmail = await this.recipeInterfaceImpl.listUsersByAccountInfo({
          tenantId,
          accountInfo: {
            email: input.newEmail
          },
          doUnionOfAccountInfo: false,
          userContext: input.userContext
        });
        let otherUsersWithNewEmail = existingUsersWithNewEmail.filter((u) => u.id !== inputUser.id);
        let otherPrimaryUserForNewEmail = otherUsersWithNewEmail.filter((u) => u.isPrimaryUser);
        if (otherPrimaryUserForNewEmail.length > 1) {
          throw new Error("You found a bug. Please report it on github.com/supertokens/supertokens-node");
        }
        if (inputUser.isPrimaryUser) {
          if (otherPrimaryUserForNewEmail.length !== 0) {
            logDebugMessage(
              `isEmailChangeAllowed: returning false cause email change will lead to two primary users having same email on ${tenantId}`
            );
            return { allowed: false, reason: "PRIMARY_USER_CONFLICT" };
          }
          if (input.isVerified) {
            logDebugMessage(
              `isEmailChangeAllowed: can change on ${tenantId} cause input user is primary, new email is verified and doesn't belong to any other primary user`
            );
            continue;
          }
          if (inputUser.loginMethods.some((lm) => lm.hasSameEmailAs(input.newEmail) && lm.verified)) {
            logDebugMessage(
              `isEmailChangeAllowed: can change on ${tenantId} cause input user is primary, new email is verified in another login method and doesn't belong to any other primary user`
            );
            continue;
          }
          if (otherUsersWithNewEmail.length === 0) {
            logDebugMessage(
              `isEmailChangeAllowed: can change on ${tenantId} cause input user is primary and the new email doesn't belong to any other user (primary or non-primary)`
            );
            continue;
          }
          const shouldDoAccountLinking = await this.config.shouldDoAutomaticAccountLinking(
            otherUsersWithNewEmail[0].loginMethods[0],
            inputUser,
            input.session,
            tenantId,
            input.userContext
          );
          if (!shouldDoAccountLinking.shouldAutomaticallyLink) {
            logDebugMessage(`isEmailChangeAllowed: can change on ${tenantId} cause linking is disabled`);
            continue;
          }
          if (!shouldDoAccountLinking.shouldRequireVerification) {
            logDebugMessage(
              `isEmailChangeAllowed: can change on ${tenantId} cause linking is doesn't require email verification`
            );
            continue;
          }
          logDebugMessage(
            `isEmailChangeAllowed: returning false because the user hasn't verified the new email address and there exists another user with it on ${tenantId} and linking requires verification`
          );
          return { allowed: false, reason: "ACCOUNT_TAKEOVER_RISK" };
        } else {
          if (input.isVerified) {
            logDebugMessage(
              `isEmailChangeAllowed: can change on ${tenantId} cause input user is not a primary and new email is verified`
            );
            continue;
          }
          if (inputUser.loginMethods[0].hasSameEmailAs(input.newEmail)) {
            logDebugMessage(
              `isEmailChangeAllowed: can change on ${tenantId} cause input user is not a primary and new email is same as the older one`
            );
            continue;
          }
          if (otherPrimaryUserForNewEmail.length === 1) {
            let shouldDoAccountLinking = await this.config.shouldDoAutomaticAccountLinking(
              inputUser.loginMethods[0],
              otherPrimaryUserForNewEmail[0],
              input.session,
              tenantId,
              input.userContext
            );
            if (!shouldDoAccountLinking.shouldAutomaticallyLink) {
              logDebugMessage(
                `isEmailChangeAllowed: can change on ${tenantId} cause input user is not a primary there exists a primary user exists with the new email, but the dev does not have account linking enabled.`
              );
              continue;
            }
            if (!shouldDoAccountLinking.shouldRequireVerification) {
              logDebugMessage(
                `isEmailChangeAllowed: can change on ${tenantId} cause input user is not a primary there exists a primary user exists with the new email, but the dev does not require email verification.`
              );
              continue;
            }
            logDebugMessage(
              "isEmailChangeAllowed: returning false cause input user is not a primary there exists a primary user exists with the new email."
            );
            return { allowed: false, reason: "ACCOUNT_TAKEOVER_RISK" };
          }
          logDebugMessage(
            `isEmailChangeAllowed: can change on ${tenantId} cause input user is not a primary no primary user exists with the new email`
          );
          continue;
        }
      }
      logDebugMessage(
        "isEmailChangeAllowed: returning true cause email change can happen on all tenants the user is part of"
      );
      return { allowed: true };
    };
    this.verifyEmailForRecipeUserIfLinkedAccountsAreVerified = async (input) => {
      try {
        EmailVerificationRecipe.getInstanceOrThrowError();
      } catch (ignored) {
        return;
      }
      if (input.user.isPrimaryUser) {
        let recipeUserEmail = void 0;
        let isAlreadyVerified = false;
        input.user.loginMethods.forEach((lm) => {
          if (lm.recipeUserId.getAsString() === input.recipeUserId.getAsString()) {
            recipeUserEmail = lm.email;
            isAlreadyVerified = lm.verified;
          }
        });
        if (recipeUserEmail !== void 0) {
          if (isAlreadyVerified) {
            return;
          }
          let shouldVerifyEmail = false;
          input.user.loginMethods.forEach((lm) => {
            if (lm.hasSameEmailAs(recipeUserEmail) && lm.verified) {
              shouldVerifyEmail = true;
            }
          });
          if (shouldVerifyEmail) {
            let resp = await EmailVerificationRecipe.getInstanceOrThrowError().recipeInterfaceImpl.createEmailVerificationToken(
              {
                // While the token we create here is tenant specific, the verification status is not
                // So we can use any tenantId the user is associated with here as long as we use the
                // same in the verifyEmailUsingToken call
                tenantId: input.user.tenantIds[0],
                recipeUserId: input.recipeUserId,
                email: recipeUserEmail,
                userContext: input.userContext
              }
            );
            if (resp.status === "OK") {
              await EmailVerificationRecipe.getInstanceOrThrowError().recipeInterfaceImpl.verifyEmailUsingToken(
                {
                  // See comment about tenantId in the createEmailVerificationToken params
                  tenantId: input.user.tenantIds[0],
                  token: resp.token,
                  attemptAccountLinking: false,
                  userContext: input.userContext
                }
              );
            }
          }
        }
      }
    };
    this.config = validateAndNormaliseUserInput(appInfo, config);
    {
      let builder = new OverrideableBuilder(
        RecipeImplementation(Querier.getNewInstanceOrThrowError(recipeId), this.config, this)
      );
      this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
    }
  }
  static init(config) {
    return (appInfo) => {
      if (_Recipe.instance === void 0) {
        _Recipe.instance = new _Recipe(
          _Recipe.RECIPE_ID,
          appInfo,
          config,
          {},
          {
            emailDelivery: void 0
          }
        );
        return _Recipe.instance;
      } else {
        throw new Error("AccountLinking recipe has already been initialised. Please check your code for bugs.");
      }
    };
  }
  // we auto init the account linking recipe here cause we always require this
  // to be initialized even if the user has not initialized it.
  // The side effect of this is that if there are any APIs or errors specific to this recipe,
  // those won't be handled by the supertokens middleware and error handler (cause this recipe
  // is not in the recipeList).
  static getInstance() {
    if (_Recipe.instance === void 0) {
      _Recipe.init()(
        supertokens.getInstanceOrThrowError().appInfo,
        supertokens.getInstanceOrThrowError().isInServerlessEnv
      );
    }
    return _Recipe.instance;
  }
  getAPIsHandled() {
    return [];
  }
  handleAPIRequest(_id, _tenantId, _req, _response, _path, _method) {
    throw new Error("Should never come here");
  }
  handleError(error2, _request, _response) {
    throw error2;
  }
  getAllCORSHeaders() {
    return [];
  }
  isErrorFromThisRecipe(err) {
    return SuperTokensError.isErrorFromSuperTokens(err) && err.fromRecipe === _Recipe.RECIPE_ID;
  }
  static reset() {
    if (env.TEST_MODE !== "testing") {
      throw new Error("calling testing function in non testing env");
    }
    _Recipe.instance = void 0;
  }
  async shouldBecomePrimaryUser(user, tenantId, session, userContext) {
    const shouldDoAccountLinking = await this.config.shouldDoAutomaticAccountLinking(
      user.loginMethods[0],
      void 0,
      session,
      tenantId,
      userContext
    );
    if (!shouldDoAccountLinking.shouldAutomaticallyLink) {
      logDebugMessage("shouldBecomePrimaryUser returning false because shouldAutomaticallyLink is false");
      return false;
    }
    if (shouldDoAccountLinking.shouldRequireVerification && !user.loginMethods[0].verified) {
      logDebugMessage(
        "shouldBecomePrimaryUser returning false because shouldRequireVerification is true but the login method is not verified"
      );
      return false;
    }
    logDebugMessage("shouldBecomePrimaryUser returning true");
    return true;
  }
  async tryLinkingByAccountInfoOrCreatePrimaryUser({
    inputUser,
    session,
    tenantId,
    userContext
  }) {
    let tries = 0;
    while (tries++ < 100) {
      const primaryUserThatCanBeLinkedToTheInputUser = await this.getPrimaryUserThatCanBeLinkedToRecipeUserId({
        user: inputUser,
        tenantId,
        userContext
      });
      if (primaryUserThatCanBeLinkedToTheInputUser !== void 0) {
        logDebugMessage("tryLinkingByAccountInfoOrCreatePrimaryUser: got primary user we can try linking");
        if (!primaryUserThatCanBeLinkedToTheInputUser.loginMethods.some(
          (lm) => lm.recipeUserId.getAsString() === inputUser.loginMethods[0].recipeUserId.getAsString()
        )) {
          let shouldDoAccountLinking = await this.config.shouldDoAutomaticAccountLinking(
            inputUser.loginMethods[0],
            primaryUserThatCanBeLinkedToTheInputUser,
            session,
            tenantId,
            userContext
          );
          if (!shouldDoAccountLinking.shouldAutomaticallyLink) {
            logDebugMessage(
              "tryLinkingByAccountInfoOrCreatePrimaryUser: not linking because shouldAutomaticallyLink is false"
            );
            return { status: "NO_LINK" };
          }
          const accountInfoVerifiedInPrimUser = primaryUserThatCanBeLinkedToTheInputUser.loginMethods.some(
            (lm) => inputUser.loginMethods[0].email !== void 0 && lm.hasSameEmailAs(inputUser.loginMethods[0].email) || inputUser.loginMethods[0].phoneNumber !== void 0 && lm.hasSamePhoneNumberAs(inputUser.loginMethods[0].phoneNumber) && lm.verified
          );
          if (shouldDoAccountLinking.shouldRequireVerification && (!inputUser.loginMethods[0].verified || !accountInfoVerifiedInPrimUser)) {
            logDebugMessage(
              "tryLinkingByAccountInfoOrCreatePrimaryUser: not linking because shouldRequireVerification is true but the login method is not verified in the new or the primary user"
            );
            return { status: "NO_LINK" };
          }
          logDebugMessage("tryLinkingByAccountInfoOrCreatePrimaryUser linking");
          let linkAccountsResult = await this.recipeInterfaceImpl.linkAccounts({
            recipeUserId: inputUser.loginMethods[0].recipeUserId,
            primaryUserId: primaryUserThatCanBeLinkedToTheInputUser.id,
            userContext
          });
          if (linkAccountsResult.status === "OK") {
            logDebugMessage("tryLinkingByAccountInfoOrCreatePrimaryUser successfully linked");
            return { status: "OK", user: linkAccountsResult.user };
          } else if (linkAccountsResult.status === "RECIPE_USER_ID_ALREADY_LINKED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR") {
            logDebugMessage("tryLinkingByAccountInfoOrCreatePrimaryUser already linked to another user");
            return {
              status: "OK",
              user: linkAccountsResult.user
            };
          } else if (linkAccountsResult.status === "INPUT_USER_IS_NOT_A_PRIMARY_USER") {
            logDebugMessage(
              "tryLinkingByAccountInfoOrCreatePrimaryUser linking failed because of a race condition"
            );
            continue;
          } else {
            logDebugMessage(
              "tryLinkingByAccountInfoOrCreatePrimaryUser linking failed because of a race condition"
            );
            continue;
          }
        }
        return { status: "OK", user: inputUser };
      }
      const oldestUserThatCanBeLinkedToTheInputUser = await this.getOldestUserThatCanBeLinkedToRecipeUser({
        user: inputUser,
        tenantId,
        userContext
      });
      if (oldestUserThatCanBeLinkedToTheInputUser !== void 0 && oldestUserThatCanBeLinkedToTheInputUser.id !== inputUser.id) {
        logDebugMessage("tryLinkingByAccountInfoOrCreatePrimaryUser: got an older user we can try linking");
        let shouldMakeOlderUserPrimary = await this.shouldBecomePrimaryUser(
          oldestUserThatCanBeLinkedToTheInputUser,
          tenantId,
          session,
          userContext
        );
        if (shouldMakeOlderUserPrimary) {
          const createPrimaryUserResult = await this.recipeInterfaceImpl.createPrimaryUser({
            recipeUserId: oldestUserThatCanBeLinkedToTheInputUser.loginMethods[0].recipeUserId,
            userContext
          });
          if (createPrimaryUserResult.status === "ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR" || createPrimaryUserResult.status === "RECIPE_USER_ID_ALREADY_LINKED_WITH_PRIMARY_USER_ID_ERROR") {
            logDebugMessage(
              "tryLinkingByAccountInfoOrCreatePrimaryUser: retrying because createPrimaryUser returned " + createPrimaryUserResult.status
            );
            continue;
          }
          let shouldDoAccountLinking = await this.config.shouldDoAutomaticAccountLinking(
            inputUser.loginMethods[0],
            primaryUserThatCanBeLinkedToTheInputUser,
            session,
            tenantId,
            userContext
          );
          if (!shouldDoAccountLinking.shouldAutomaticallyLink) {
            logDebugMessage(
              "tryLinkingByAccountInfoOrCreatePrimaryUser: not linking because shouldAutomaticallyLink is false"
            );
            return { status: "NO_LINK" };
          }
          if (shouldDoAccountLinking.shouldRequireVerification && !inputUser.loginMethods[0].verified) {
            logDebugMessage(
              "tryLinkingByAccountInfoOrCreatePrimaryUser: not linking because shouldRequireVerification is true but the login method is not verified"
            );
            return { status: "NO_LINK" };
          }
          logDebugMessage("tryLinkingByAccountInfoOrCreatePrimaryUser linking");
          let linkAccountsResult = await this.recipeInterfaceImpl.linkAccounts({
            recipeUserId: inputUser.loginMethods[0].recipeUserId,
            primaryUserId: createPrimaryUserResult.user.id,
            userContext
          });
          if (linkAccountsResult.status === "OK") {
            logDebugMessage("tryLinkingByAccountInfoOrCreatePrimaryUser successfully linked");
            return { status: "OK", user: linkAccountsResult.user };
          } else if (linkAccountsResult.status === "RECIPE_USER_ID_ALREADY_LINKED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR") {
            logDebugMessage("tryLinkingByAccountInfoOrCreatePrimaryUser already linked to another user");
            return {
              status: "OK",
              user: linkAccountsResult.user
            };
          } else if (linkAccountsResult.status === "INPUT_USER_IS_NOT_A_PRIMARY_USER") {
            logDebugMessage(
              "tryLinkingByAccountInfoOrCreatePrimaryUser linking failed because of a race condition"
            );
            continue;
          } else {
            logDebugMessage(
              "tryLinkingByAccountInfoOrCreatePrimaryUser linking failed because of a race condition"
            );
            continue;
          }
        }
      }
      logDebugMessage("tryLinkingByAccountInfoOrCreatePrimaryUser: trying to make the current user primary");
      if (await this.shouldBecomePrimaryUser(inputUser, tenantId, session, userContext)) {
        let createPrimaryUserResult = await this.recipeInterfaceImpl.createPrimaryUser({
          recipeUserId: inputUser.loginMethods[0].recipeUserId,
          userContext
        });
        if (createPrimaryUserResult.status === "ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR" || createPrimaryUserResult.status === "RECIPE_USER_ID_ALREADY_LINKED_WITH_PRIMARY_USER_ID_ERROR") {
          continue;
        }
        return createPrimaryUserResult;
      } else {
        return { status: "OK", user: inputUser };
      }
    }
    throw new Error("This should never happen: ran out of retries for tryLinkingByAccountInfoOrCreatePrimaryUser");
  }
};
_Recipe.instance = void 0;
_Recipe.RECIPE_ID = "accountlinking";
let Recipe = _Recipe;
export {
  Recipe as default
};
