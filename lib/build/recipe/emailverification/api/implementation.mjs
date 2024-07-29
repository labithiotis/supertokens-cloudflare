import { logDebugMessage } from "../../../logger";
import EmailVerificationRecipe from "../recipe";
import { EmailVerificationClaim } from "../emailVerificationClaim";
import SessionError from "../../session/error";
import { getEmailVerifyLink } from "../utils";
function getAPIInterface() {
  return {
    verifyEmailPOST: async function({ token, tenantId, session, options, userContext }) {
      const verifyTokenResponse = await options.recipeImplementation.verifyEmailUsingToken({
        token,
        tenantId,
        attemptAccountLinking: true,
        userContext
      });
      if (verifyTokenResponse.status === "EMAIL_VERIFICATION_INVALID_TOKEN_ERROR") {
        return verifyTokenResponse;
      }
      let newSession = await EmailVerificationRecipe.getInstanceOrThrowError().updateSessionIfRequiredPostEmailVerification(
        {
          req: options.req,
          res: options.res,
          session,
          recipeUserIdWhoseEmailGotVerified: verifyTokenResponse.user.recipeUserId,
          userContext
        }
      );
      return {
        status: "OK",
        user: verifyTokenResponse.user,
        newSession
      };
    },
    isEmailVerifiedGET: async function({ userContext, session, options }) {
      const emailInfo = await EmailVerificationRecipe.getInstanceOrThrowError().getEmailForRecipeUserId(
        void 0,
        session.getRecipeUserId(userContext),
        userContext
      );
      if (emailInfo.status === "OK") {
        const isVerified = await options.recipeImplementation.isEmailVerified({
          recipeUserId: session.getRecipeUserId(userContext),
          email: emailInfo.email,
          userContext
        });
        if (isVerified) {
          let newSession = await EmailVerificationRecipe.getInstanceOrThrowError().updateSessionIfRequiredPostEmailVerification(
            {
              req: options.req,
              res: options.res,
              session,
              recipeUserIdWhoseEmailGotVerified: session.getRecipeUserId(userContext),
              userContext
            }
          );
          return {
            status: "OK",
            isVerified: true,
            newSession
          };
        } else {
          await session.setClaimValue(EmailVerificationClaim, false, userContext);
          return {
            status: "OK",
            isVerified: false
          };
        }
      } else if (emailInfo.status === "EMAIL_DOES_NOT_EXIST_ERROR") {
        return {
          status: "OK",
          isVerified: true
        };
      } else {
        throw new SessionError({
          type: SessionError.UNAUTHORISED,
          message: "Unknown User ID provided"
        });
      }
    },
    generateEmailVerifyTokenPOST: async function({ options, userContext, session }) {
      const tenantId = session.getTenantId();
      const emailInfo = await EmailVerificationRecipe.getInstanceOrThrowError().getEmailForRecipeUserId(
        void 0,
        session.getRecipeUserId(userContext),
        userContext
      );
      if (emailInfo.status === "EMAIL_DOES_NOT_EXIST_ERROR") {
        logDebugMessage(
          `Email verification email not sent to user ${session.getRecipeUserId(userContext).getAsString()} because it doesn't have an email address.`
        );
        let newSession = await EmailVerificationRecipe.getInstanceOrThrowError().updateSessionIfRequiredPostEmailVerification(
          {
            req: options.req,
            res: options.res,
            session,
            recipeUserIdWhoseEmailGotVerified: session.getRecipeUserId(userContext),
            userContext
          }
        );
        return {
          status: "EMAIL_ALREADY_VERIFIED_ERROR",
          newSession
        };
      } else if (emailInfo.status === "OK") {
        let response = await options.recipeImplementation.createEmailVerificationToken({
          recipeUserId: session.getRecipeUserId(userContext),
          email: emailInfo.email,
          tenantId,
          userContext
        });
        if (response.status === "EMAIL_ALREADY_VERIFIED_ERROR") {
          logDebugMessage(
            `Email verification email not sent to user ${session.getRecipeUserId(userContext).getAsString()} because it is already verified.`
          );
          let newSession = await EmailVerificationRecipe.getInstanceOrThrowError().updateSessionIfRequiredPostEmailVerification(
            {
              req: options.req,
              res: options.res,
              session,
              recipeUserIdWhoseEmailGotVerified: session.getRecipeUserId(userContext),
              userContext
            }
          );
          return {
            status: "EMAIL_ALREADY_VERIFIED_ERROR",
            newSession
          };
        }
        if (await session.getClaimValue(EmailVerificationClaim) !== false) {
          await session.fetchAndSetClaim(EmailVerificationClaim, userContext);
        }
        let emailVerifyLink = getEmailVerifyLink({
          appInfo: options.appInfo,
          token: response.token,
          tenantId,
          request: options.req,
          userContext
        });
        logDebugMessage(`Sending email verification email to ${emailInfo}`);
        await options.emailDelivery.ingredientInterfaceImpl.sendEmail({
          type: "EMAIL_VERIFICATION",
          user: {
            id: session.getUserId(),
            recipeUserId: session.getRecipeUserId(userContext),
            email: emailInfo.email
          },
          emailVerifyLink,
          tenantId,
          userContext
        });
        return {
          status: "OK"
        };
      } else {
        logDebugMessage(
          "generateEmailVerifyTokenPOST: Returning UNAUTHORISED because the user id provided is unknown"
        );
        throw new SessionError({ type: SessionError.UNAUTHORISED, message: "Unknown User ID provided" });
      }
    }
  };
}
export {
  getAPIInterface as default
};
