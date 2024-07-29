import { logDebugMessage } from "../../../logger";
import { getUser } from "../../../";
import AccountLinking from "../../accountlinking/recipe";
import EmailVerification from "../../emailverification/recipe";
import RecipeUserId from "../../../recipeUserId";
import { getPasswordResetLink } from "../utils";
import { AuthUtils } from "../../../authUtils";
import { isFakeEmail } from "../../thirdparty/utils";
function getAPIImplementation() {
  return {
    emailExistsGET: async function({
      email,
      tenantId,
      userContext
    }) {
      let users = await AccountLinking.getInstance().recipeInterfaceImpl.listUsersByAccountInfo({
        tenantId,
        accountInfo: {
          email
        },
        doUnionOfAccountInfo: false,
        userContext
      });
      let emailPasswordUserExists = users.find((u) => {
        return u.loginMethods.find((lm) => lm.recipeId === "emailpassword" && lm.hasSameEmailAs(email)) !== void 0;
      }) !== void 0;
      return {
        status: "OK",
        exists: emailPasswordUserExists
      };
    },
    generatePasswordResetTokenPOST: async function({
      formFields,
      tenantId,
      options,
      userContext
    }) {
      const email = formFields.filter((f) => f.id === "email")[0].value;
      async function generateAndSendPasswordResetToken(primaryUserId, recipeUserId) {
        let response = await options.recipeImplementation.createResetPasswordToken({
          tenantId,
          userId: recipeUserId === void 0 ? primaryUserId : recipeUserId.getAsString(),
          email,
          userContext
        });
        if (response.status === "UNKNOWN_USER_ID_ERROR") {
          logDebugMessage(
            `Password reset email not sent, unknown user id: ${recipeUserId === void 0 ? primaryUserId : recipeUserId.getAsString()}`
          );
          return {
            status: "OK"
          };
        }
        let passwordResetLink = getPasswordResetLink({
          appInfo: options.appInfo,
          token: response.token,
          tenantId,
          request: options.req,
          userContext
        });
        logDebugMessage(`Sending password reset email to ${email}`);
        await options.emailDelivery.ingredientInterfaceImpl.sendEmail({
          tenantId,
          type: "PASSWORD_RESET",
          user: {
            id: primaryUserId,
            recipeUserId,
            email
          },
          passwordResetLink,
          userContext
        });
        return {
          status: "OK"
        };
      }
      let users = await AccountLinking.getInstance().recipeInterfaceImpl.listUsersByAccountInfo({
        tenantId,
        accountInfo: {
          email
        },
        doUnionOfAccountInfo: false,
        userContext
      });
      let emailPasswordAccount = void 0;
      for (let i = 0; i < users.length; i++) {
        let emailPasswordAccountTmp = users[i].loginMethods.find(
          (l) => l.recipeId === "emailpassword" && l.hasSameEmailAs(email)
        );
        if (emailPasswordAccountTmp !== void 0) {
          emailPasswordAccount = emailPasswordAccountTmp;
          break;
        }
      }
      let primaryUserAssociatedWithEmail = users.find((u) => u.isPrimaryUser);
      if (primaryUserAssociatedWithEmail === void 0) {
        if (emailPasswordAccount === void 0) {
          logDebugMessage(`Password reset email not sent, unknown user email: ${email}`);
          return {
            status: "OK"
          };
        }
        return await generateAndSendPasswordResetToken(
          emailPasswordAccount.recipeUserId.getAsString(),
          emailPasswordAccount.recipeUserId
        );
      }
      let emailVerified = primaryUserAssociatedWithEmail.loginMethods.find((lm) => {
        return lm.hasSameEmailAs(email) && lm.verified;
      }) !== void 0;
      let hasOtherEmailOrPhone = primaryUserAssociatedWithEmail.loginMethods.find((lm) => {
        return lm.email !== void 0 && !lm.hasSameEmailAs(email) || lm.phoneNumber !== void 0;
      }) !== void 0;
      if (!emailVerified && hasOtherEmailOrPhone) {
        return {
          status: "PASSWORD_RESET_NOT_ALLOWED",
          reason: "Reset password link was not created because of account take over risk. Please contact support. (ERR_CODE_001)"
        };
      }
      let shouldDoAccountLinkingResponse = await AccountLinking.getInstance().config.shouldDoAutomaticAccountLinking(
        emailPasswordAccount !== void 0 ? emailPasswordAccount : {
          recipeId: "emailpassword",
          email
        },
        primaryUserAssociatedWithEmail,
        void 0,
        tenantId,
        userContext
      );
      if (emailPasswordAccount === void 0) {
        if (!shouldDoAccountLinkingResponse.shouldAutomaticallyLink) {
          logDebugMessage(
            `Password reset email not sent, since email password user didn't exist, and account linking not enabled`
          );
          return {
            status: "OK"
          };
        }
        let isSignUpAllowed = await AccountLinking.getInstance().isSignUpAllowed({
          newUser: {
            recipeId: "emailpassword",
            email
          },
          isVerified: true,
          // cause when the token is consumed, we will mark the email as verified
          session: void 0,
          tenantId,
          userContext
        });
        if (isSignUpAllowed) {
          return await generateAndSendPasswordResetToken(primaryUserAssociatedWithEmail.id, void 0);
        } else {
          logDebugMessage(
            `Password reset email not sent, isSignUpAllowed returned false for email: ${email}`
          );
          return {
            status: "OK"
          };
        }
      }
      let areTheTwoAccountsLinked = primaryUserAssociatedWithEmail.loginMethods.find((lm) => {
        return lm.recipeUserId.getAsString() === emailPasswordAccount.recipeUserId.getAsString();
      }) !== void 0;
      if (areTheTwoAccountsLinked) {
        return await generateAndSendPasswordResetToken(
          primaryUserAssociatedWithEmail.id,
          emailPasswordAccount.recipeUserId
        );
      }
      if (!shouldDoAccountLinkingResponse.shouldAutomaticallyLink) {
        return await generateAndSendPasswordResetToken(
          emailPasswordAccount.recipeUserId.getAsString(),
          emailPasswordAccount.recipeUserId
        );
      }
      if (!shouldDoAccountLinkingResponse.shouldRequireVerification) {
        return await generateAndSendPasswordResetToken(
          primaryUserAssociatedWithEmail.id,
          emailPasswordAccount.recipeUserId
        );
      }
      return await generateAndSendPasswordResetToken(
        primaryUserAssociatedWithEmail.id,
        emailPasswordAccount.recipeUserId
      );
    },
    passwordResetPOST: async function({
      formFields,
      token,
      tenantId,
      options,
      userContext
    }) {
      async function markEmailAsVerified(recipeUserId, email) {
        const emailVerificationInstance = EmailVerification.getInstance();
        if (emailVerificationInstance) {
          const tokenResponse = await emailVerificationInstance.recipeInterfaceImpl.createEmailVerificationToken(
            {
              tenantId,
              recipeUserId,
              email,
              userContext
            }
          );
          if (tokenResponse.status === "OK") {
            await emailVerificationInstance.recipeInterfaceImpl.verifyEmailUsingToken({
              tenantId,
              token: tokenResponse.token,
              attemptAccountLinking: false,
              // we pass false here cause
              // we anyway do account linking in this API after this function is
              // called.
              userContext
            });
          }
        }
      }
      async function doUpdatePasswordAndVerifyEmailAndTryLinkIfNotPrimary(recipeUserId) {
        let updateResponse = await options.recipeImplementation.updateEmailOrPassword({
          tenantIdForPasswordPolicy: tenantId,
          // we can treat userIdForWhomTokenWasGenerated as a recipe user id cause
          // whenever this function is called,
          recipeUserId,
          password: newPassword,
          userContext
        });
        if (updateResponse.status === "EMAIL_ALREADY_EXISTS_ERROR" || updateResponse.status === "EMAIL_CHANGE_NOT_ALLOWED_ERROR") {
          throw new Error("This should never come here because we are not updating the email");
        } else if (updateResponse.status === "UNKNOWN_USER_ID_ERROR") {
          return {
            status: "RESET_PASSWORD_INVALID_TOKEN_ERROR"
          };
        } else if (updateResponse.status === "PASSWORD_POLICY_VIOLATED_ERROR") {
          return {
            status: "PASSWORD_POLICY_VIOLATED_ERROR",
            failureReason: updateResponse.failureReason
          };
        } else {
          await markEmailAsVerified(recipeUserId, emailForWhomTokenWasGenerated);
          const updatedUserAfterEmailVerification = await getUser(recipeUserId.getAsString(), userContext);
          if (updatedUserAfterEmailVerification === void 0) {
            throw new Error("Should never happen - user deleted after during password reset");
          }
          if (updatedUserAfterEmailVerification.isPrimaryUser) {
            return {
              status: "OK",
              email: emailForWhomTokenWasGenerated,
              user: updatedUserAfterEmailVerification
            };
          }
          const linkRes = await AccountLinking.getInstance().tryLinkingByAccountInfoOrCreatePrimaryUser({
            tenantId,
            inputUser: updatedUserAfterEmailVerification,
            session: void 0,
            userContext
          });
          const userAfterWeTriedLinking = linkRes.status === "OK" ? linkRes.user : updatedUserAfterEmailVerification;
          return {
            status: "OK",
            email: emailForWhomTokenWasGenerated,
            user: userAfterWeTriedLinking
          };
        }
      }
      let newPassword = formFields.filter((f) => f.id === "password")[0].value;
      let tokenConsumptionResponse = await options.recipeImplementation.consumePasswordResetToken({
        token,
        tenantId,
        userContext
      });
      if (tokenConsumptionResponse.status === "RESET_PASSWORD_INVALID_TOKEN_ERROR") {
        return tokenConsumptionResponse;
      }
      let userIdForWhomTokenWasGenerated = tokenConsumptionResponse.userId;
      let emailForWhomTokenWasGenerated = tokenConsumptionResponse.email;
      let existingUser = await getUser(tokenConsumptionResponse.userId, userContext);
      if (existingUser === void 0) {
        return {
          status: "RESET_PASSWORD_INVALID_TOKEN_ERROR"
        };
      }
      if (existingUser.isPrimaryUser) {
        let emailPasswordUserIsLinkedToExistingUser = existingUser.loginMethods.find((lm) => {
          return lm.recipeUserId.getAsString() === userIdForWhomTokenWasGenerated && lm.recipeId === "emailpassword";
        }) !== void 0;
        if (emailPasswordUserIsLinkedToExistingUser) {
          return doUpdatePasswordAndVerifyEmailAndTryLinkIfNotPrimary(
            new RecipeUserId(userIdForWhomTokenWasGenerated)
          );
        } else {
          let createUserResponse = await options.recipeImplementation.createNewRecipeUser({
            tenantId,
            email: tokenConsumptionResponse.email,
            password: newPassword,
            userContext
          });
          if (createUserResponse.status === "EMAIL_ALREADY_EXISTS_ERROR") {
            return {
              status: "RESET_PASSWORD_INVALID_TOKEN_ERROR"
            };
          } else {
            await markEmailAsVerified(
              createUserResponse.user.loginMethods[0].recipeUserId,
              tokenConsumptionResponse.email
            );
            const updatedUser = await getUser(createUserResponse.user.id, userContext);
            if (updatedUser === void 0) {
              throw new Error("Should never happen - user deleted after during password reset");
            }
            createUserResponse.user = updatedUser;
            const linkRes = await AccountLinking.getInstance().tryLinkingByAccountInfoOrCreatePrimaryUser({
              tenantId,
              inputUser: createUserResponse.user,
              session: void 0,
              userContext
            });
            const userAfterLinking = linkRes.status === "OK" ? linkRes.user : createUserResponse.user;
            if (linkRes.status === "OK" && linkRes.user.id !== existingUser.id) {
            }
            return {
              status: "OK",
              email: tokenConsumptionResponse.email,
              user: userAfterLinking
            };
          }
        }
      } else {
        return doUpdatePasswordAndVerifyEmailAndTryLinkIfNotPrimary(
          new RecipeUserId(userIdForWhomTokenWasGenerated)
        );
      }
    },
    signInPOST: async function({
      formFields,
      tenantId,
      session,
      options,
      userContext
    }) {
      const errorCodeMap = {
        SIGN_IN_NOT_ALLOWED: "Cannot sign in due to security reasons. Please try resetting your password, use a different login method or contact support. (ERR_CODE_008)",
        LINKING_TO_SESSION_USER_FAILED: {
          EMAIL_VERIFICATION_REQUIRED: "Cannot sign in / up due to security reasons. Please contact support. (ERR_CODE_009)",
          RECIPE_USER_ID_ALREADY_LINKED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR: "Cannot sign in / up due to security reasons. Please contact support. (ERR_CODE_010)",
          ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR: "Cannot sign in / up due to security reasons. Please contact support. (ERR_CODE_011)",
          SESSION_USER_ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR: "Cannot sign in / up due to security reasons. Please contact support. (ERR_CODE_012)"
        }
      };
      let email = formFields.filter((f) => f.id === "email")[0].value;
      let password = formFields.filter((f) => f.id === "password")[0].value;
      const recipeId = "emailpassword";
      const checkCredentialsOnTenant = async (tenantId2) => {
        return (await options.recipeImplementation.verifyCredentials({ email, password, tenantId: tenantId2, userContext })).status === "OK";
      };
      if (isFakeEmail(email) && session === void 0) {
        return {
          status: "WRONG_CREDENTIALS_ERROR"
        };
      }
      const authenticatingUser = await AuthUtils.getAuthenticatingUserAndAddToCurrentTenantIfRequired({
        accountInfo: { email },
        userContext,
        recipeId,
        session,
        tenantId,
        checkCredentialsOnTenant
      });
      const isVerified = authenticatingUser !== void 0 && authenticatingUser.loginMethod.verified;
      if (authenticatingUser === void 0) {
        return {
          status: "WRONG_CREDENTIALS_ERROR"
        };
      }
      const preAuthChecks = await AuthUtils.preAuthChecks({
        authenticatingAccountInfo: {
          recipeId,
          email
        },
        factorIds: ["emailpassword"],
        isSignUp: false,
        authenticatingUser: authenticatingUser == null ? void 0 : authenticatingUser.user,
        isVerified,
        signInVerifiesLoginMethod: false,
        skipSessionUserUpdateInCore: false,
        tenantId,
        userContext,
        session
      });
      if (preAuthChecks.status === "SIGN_UP_NOT_ALLOWED") {
        throw new Error("This should never happen: pre-auth checks should not fail for sign in");
      }
      if (preAuthChecks.status !== "OK") {
        return AuthUtils.getErrorStatusResponseWithReason(preAuthChecks, errorCodeMap, "SIGN_IN_NOT_ALLOWED");
      }
      if (isFakeEmail(email) && preAuthChecks.isFirstFactor) {
        return {
          status: "WRONG_CREDENTIALS_ERROR"
        };
      }
      const signInResponse = await options.recipeImplementation.signIn({
        email,
        password,
        session,
        tenantId,
        userContext
      });
      if (signInResponse.status === "WRONG_CREDENTIALS_ERROR") {
        return signInResponse;
      }
      if (signInResponse.status !== "OK") {
        return AuthUtils.getErrorStatusResponseWithReason(signInResponse, errorCodeMap, "SIGN_IN_NOT_ALLOWED");
      }
      const postAuthChecks = await AuthUtils.postAuthChecks({
        authenticatedUser: signInResponse.user,
        recipeUserId: signInResponse.recipeUserId,
        isSignUp: false,
        factorId: "emailpassword",
        session,
        req: options.req,
        res: options.res,
        tenantId,
        userContext
      });
      if (postAuthChecks.status !== "OK") {
        return AuthUtils.getErrorStatusResponseWithReason(postAuthChecks, errorCodeMap, "SIGN_IN_NOT_ALLOWED");
      }
      return {
        status: "OK",
        session: postAuthChecks.session,
        user: postAuthChecks.user
      };
    },
    signUpPOST: async function({
      formFields,
      tenantId,
      session,
      options,
      userContext
    }) {
      const errorCodeMap = {
        SIGN_UP_NOT_ALLOWED: "Cannot sign up due to security reasons. Please try logging in, use a different login method or contact support. (ERR_CODE_007)",
        LINKING_TO_SESSION_USER_FAILED: {
          EMAIL_VERIFICATION_REQUIRED: "Cannot sign in / up due to security reasons. Please contact support. (ERR_CODE_013)",
          RECIPE_USER_ID_ALREADY_LINKED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR: "Cannot sign in / up due to security reasons. Please contact support. (ERR_CODE_014)",
          ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR: "Cannot sign in / up due to security reasons. Please contact support. (ERR_CODE_015)",
          SESSION_USER_ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR: "Cannot sign in / up due to security reasons. Please contact support. (ERR_CODE_016)"
        }
      };
      let email = formFields.filter((f) => f.id === "email")[0].value;
      let password = formFields.filter((f) => f.id === "password")[0].value;
      const preAuthCheckRes = await AuthUtils.preAuthChecks({
        authenticatingAccountInfo: {
          recipeId: "emailpassword",
          email
        },
        factorIds: ["emailpassword"],
        isSignUp: true,
        isVerified: isFakeEmail(email),
        signInVerifiesLoginMethod: false,
        skipSessionUserUpdateInCore: false,
        authenticatingUser: void 0,
        // since this a sign up, this is undefined
        tenantId,
        userContext,
        session
      });
      if (preAuthCheckRes.status === "SIGN_UP_NOT_ALLOWED") {
        const conflictingUsers = await AccountLinking.getInstance().recipeInterfaceImpl.listUsersByAccountInfo({
          tenantId,
          accountInfo: {
            email
          },
          doUnionOfAccountInfo: false,
          userContext
        });
        if (conflictingUsers.some(
          (u) => u.loginMethods.some((lm) => lm.recipeId === "emailpassword" && lm.hasSameEmailAs(email))
        )) {
          return {
            status: "EMAIL_ALREADY_EXISTS_ERROR"
          };
        }
      }
      if (preAuthCheckRes.status !== "OK") {
        return AuthUtils.getErrorStatusResponseWithReason(preAuthCheckRes, errorCodeMap, "SIGN_UP_NOT_ALLOWED");
      }
      if (isFakeEmail(email) && preAuthCheckRes.isFirstFactor) {
        return {
          status: "EMAIL_ALREADY_EXISTS_ERROR"
        };
      }
      const signUpResponse = await options.recipeImplementation.signUp({
        tenantId,
        email,
        password,
        session,
        userContext
      });
      if (signUpResponse.status === "EMAIL_ALREADY_EXISTS_ERROR") {
        return signUpResponse;
      }
      if (signUpResponse.status !== "OK") {
        return AuthUtils.getErrorStatusResponseWithReason(signUpResponse, errorCodeMap, "SIGN_UP_NOT_ALLOWED");
      }
      const postAuthChecks = await AuthUtils.postAuthChecks({
        authenticatedUser: signUpResponse.user,
        recipeUserId: signUpResponse.recipeUserId,
        isSignUp: true,
        factorId: "emailpassword",
        session,
        req: options.req,
        res: options.res,
        tenantId,
        userContext
      });
      if (postAuthChecks.status !== "OK") {
        return AuthUtils.getErrorStatusResponseWithReason(postAuthChecks, errorCodeMap, "SIGN_UP_NOT_ALLOWED");
      }
      return {
        status: "OK",
        session: postAuthChecks.session,
        user: postAuthChecks.user
      };
    }
  };
}
export {
  getAPIImplementation as default
};
