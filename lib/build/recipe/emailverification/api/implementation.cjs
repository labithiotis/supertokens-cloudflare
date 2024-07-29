"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var implementation_exports = {};
__export(implementation_exports, {
  default: () => getAPIInterface
});
module.exports = __toCommonJS(implementation_exports);
var import_logger = require("../../../logger");
var import_recipe = __toESM(require("../recipe"), 1);
var import_emailVerificationClaim = require("../emailVerificationClaim");
var import_error = __toESM(require("../../session/error"), 1);
var import_utils = require("../utils");
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
      let newSession = await import_recipe.default.getInstanceOrThrowError().updateSessionIfRequiredPostEmailVerification(
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
      const emailInfo = await import_recipe.default.getInstanceOrThrowError().getEmailForRecipeUserId(
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
          let newSession = await import_recipe.default.getInstanceOrThrowError().updateSessionIfRequiredPostEmailVerification(
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
          await session.setClaimValue(import_emailVerificationClaim.EmailVerificationClaim, false, userContext);
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
        throw new import_error.default({
          type: import_error.default.UNAUTHORISED,
          message: "Unknown User ID provided"
        });
      }
    },
    generateEmailVerifyTokenPOST: async function({ options, userContext, session }) {
      const tenantId = session.getTenantId();
      const emailInfo = await import_recipe.default.getInstanceOrThrowError().getEmailForRecipeUserId(
        void 0,
        session.getRecipeUserId(userContext),
        userContext
      );
      if (emailInfo.status === "EMAIL_DOES_NOT_EXIST_ERROR") {
        (0, import_logger.logDebugMessage)(
          `Email verification email not sent to user ${session.getRecipeUserId(userContext).getAsString()} because it doesn't have an email address.`
        );
        let newSession = await import_recipe.default.getInstanceOrThrowError().updateSessionIfRequiredPostEmailVerification(
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
          (0, import_logger.logDebugMessage)(
            `Email verification email not sent to user ${session.getRecipeUserId(userContext).getAsString()} because it is already verified.`
          );
          let newSession = await import_recipe.default.getInstanceOrThrowError().updateSessionIfRequiredPostEmailVerification(
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
        if (await session.getClaimValue(import_emailVerificationClaim.EmailVerificationClaim) !== false) {
          await session.fetchAndSetClaim(import_emailVerificationClaim.EmailVerificationClaim, userContext);
        }
        let emailVerifyLink = (0, import_utils.getEmailVerifyLink)({
          appInfo: options.appInfo,
          token: response.token,
          tenantId,
          request: options.req,
          userContext
        });
        (0, import_logger.logDebugMessage)(`Sending email verification email to ${emailInfo}`);
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
        (0, import_logger.logDebugMessage)(
          "generateEmailVerifyTokenPOST: Returning UNAUTHORISED because the user id provided is unknown"
        );
        throw new import_error.default({ type: import_error.default.UNAUTHORISED, message: "Unknown User ID provided" });
      }
    }
  };
}
