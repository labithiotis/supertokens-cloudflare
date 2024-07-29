var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
import Recipe from "./recipe";
import SuperTokensError from "./error";
import { EmailVerificationClaim } from "./emailVerificationClaim";
import { getEmailVerifyLink } from "./utils";
import { getRequestFromUserContext } from "../..";
import { getUserContext } from "../../utils";
class Wrapper {
  static async createEmailVerificationToken(tenantId, recipeUserId, email, userContext) {
    const ctx = getUserContext(userContext);
    const recipeInstance = Recipe.getInstanceOrThrowError();
    if (email === void 0) {
      const emailInfo = await recipeInstance.getEmailForRecipeUserId(void 0, recipeUserId, ctx);
      if (emailInfo.status === "OK") {
        email = emailInfo.email;
      } else if (emailInfo.status === "EMAIL_DOES_NOT_EXIST_ERROR") {
        return {
          status: "EMAIL_ALREADY_VERIFIED_ERROR"
        };
      } else {
        throw new global.Error("Unknown User ID provided without email");
      }
    }
    return await recipeInstance.recipeInterfaceImpl.createEmailVerificationToken({
      recipeUserId,
      email,
      tenantId,
      userContext: ctx
    });
  }
  static async createEmailVerificationLink(tenantId, recipeUserId, email, userContext) {
    const ctx = getUserContext(userContext);
    const recipeInstance = Recipe.getInstanceOrThrowError();
    const appInfo = recipeInstance.getAppInfo();
    let emailVerificationToken = await createEmailVerificationToken(tenantId, recipeUserId, email, ctx);
    if (emailVerificationToken.status === "EMAIL_ALREADY_VERIFIED_ERROR") {
      return {
        status: "EMAIL_ALREADY_VERIFIED_ERROR"
      };
    }
    return {
      status: "OK",
      link: getEmailVerifyLink({
        appInfo,
        token: emailVerificationToken.token,
        tenantId,
        request: getRequestFromUserContext(ctx),
        userContext: ctx
      })
    };
  }
  static async sendEmailVerificationEmail(tenantId, userId, recipeUserId, email, userContext) {
    const ctx = getUserContext(userContext);
    if (email === void 0) {
      const recipeInstance = Recipe.getInstanceOrThrowError();
      const emailInfo = await recipeInstance.getEmailForRecipeUserId(void 0, recipeUserId, ctx);
      if (emailInfo.status === "OK") {
        email = emailInfo.email;
      } else if (emailInfo.status === "EMAIL_DOES_NOT_EXIST_ERROR") {
        return {
          status: "EMAIL_ALREADY_VERIFIED_ERROR"
        };
      } else {
        throw new global.Error("Unknown User ID provided without email");
      }
    }
    let emailVerificationLink = await this.createEmailVerificationLink(tenantId, recipeUserId, email, ctx);
    if (emailVerificationLink.status === "EMAIL_ALREADY_VERIFIED_ERROR") {
      return {
        status: "EMAIL_ALREADY_VERIFIED_ERROR"
      };
    }
    await sendEmail({
      type: "EMAIL_VERIFICATION",
      user: {
        id: userId,
        recipeUserId,
        email
      },
      emailVerifyLink: emailVerificationLink.link,
      tenantId,
      userContext: ctx
    });
    return {
      status: "OK"
    };
  }
  static async verifyEmailUsingToken(tenantId, token, attemptAccountLinking = true, userContext) {
    return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.verifyEmailUsingToken({
      token,
      tenantId,
      attemptAccountLinking,
      userContext: getUserContext(userContext)
    });
  }
  static async isEmailVerified(recipeUserId, email, userContext) {
    const ctx = getUserContext(userContext);
    const recipeInstance = Recipe.getInstanceOrThrowError();
    if (email === void 0) {
      const emailInfo = await recipeInstance.getEmailForRecipeUserId(void 0, recipeUserId, ctx);
      if (emailInfo.status === "OK") {
        email = emailInfo.email;
      } else if (emailInfo.status === "EMAIL_DOES_NOT_EXIST_ERROR") {
        return true;
      } else {
        throw new global.Error("Unknown User ID provided without email");
      }
    }
    return await recipeInstance.recipeInterfaceImpl.isEmailVerified({
      recipeUserId,
      email,
      userContext: ctx
    });
  }
  static async revokeEmailVerificationTokens(tenantId, recipeUserId, email, userContext) {
    const ctx = getUserContext(userContext);
    const recipeInstance = Recipe.getInstanceOrThrowError();
    if (email === void 0) {
      const emailInfo = await recipeInstance.getEmailForRecipeUserId(void 0, recipeUserId, ctx);
      if (emailInfo.status === "OK") {
        email = emailInfo.email;
      } else if (emailInfo.status === "EMAIL_DOES_NOT_EXIST_ERROR") {
        return {
          status: "OK"
        };
      } else {
        throw new global.Error("Unknown User ID provided without email");
      }
    }
    return await recipeInstance.recipeInterfaceImpl.revokeEmailVerificationTokens({
      recipeUserId,
      email,
      tenantId,
      userContext: ctx
    });
  }
  static async unverifyEmail(recipeUserId, email, userContext) {
    const ctx = getUserContext(userContext);
    const recipeInstance = Recipe.getInstanceOrThrowError();
    if (email === void 0) {
      const emailInfo = await recipeInstance.getEmailForRecipeUserId(void 0, recipeUserId, ctx);
      if (emailInfo.status === "OK") {
        email = emailInfo.email;
      } else if (emailInfo.status === "EMAIL_DOES_NOT_EXIST_ERROR") {
        return {
          status: "OK"
        };
      } else {
        throw new global.Error("Unknown User ID provided without email");
      }
    }
    return await recipeInstance.recipeInterfaceImpl.unverifyEmail({
      recipeUserId,
      email,
      userContext: ctx
    });
  }
  static async sendEmail(input) {
    let recipeInstance = Recipe.getInstanceOrThrowError();
    return await recipeInstance.emailDelivery.ingredientInterfaceImpl.sendEmail(__spreadProps(__spreadValues({}, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
}
Wrapper.init = Recipe.init;
Wrapper.Error = SuperTokensError;
Wrapper.EmailVerificationClaim = EmailVerificationClaim;
let init = Wrapper.init;
let Error2 = Wrapper.Error;
let createEmailVerificationToken = Wrapper.createEmailVerificationToken;
let createEmailVerificationLink = Wrapper.createEmailVerificationLink;
let sendEmailVerificationEmail = Wrapper.sendEmailVerificationEmail;
let verifyEmailUsingToken = Wrapper.verifyEmailUsingToken;
let isEmailVerified = Wrapper.isEmailVerified;
let revokeEmailVerificationTokens = Wrapper.revokeEmailVerificationTokens;
let unverifyEmail = Wrapper.unverifyEmail;
let sendEmail = Wrapper.sendEmail;
import { EmailVerificationClaim as EmailVerificationClaim2 } from "./emailVerificationClaim";
export {
  EmailVerificationClaim2 as EmailVerificationClaim,
  Error2 as Error,
  createEmailVerificationLink,
  createEmailVerificationToken,
  Wrapper as default,
  init,
  isEmailVerified,
  revokeEmailVerificationTokens,
  sendEmail,
  sendEmailVerificationEmail,
  unverifyEmail,
  verifyEmailUsingToken
};
