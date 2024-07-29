"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var emailverification_exports = {};
__export(emailverification_exports, {
  EmailVerificationClaim: () => import_emailVerificationClaim2.EmailVerificationClaim,
  Error: () => Error2,
  createEmailVerificationLink: () => createEmailVerificationLink,
  createEmailVerificationToken: () => createEmailVerificationToken,
  default: () => Wrapper,
  init: () => init,
  isEmailVerified: () => isEmailVerified,
  revokeEmailVerificationTokens: () => revokeEmailVerificationTokens,
  sendEmail: () => sendEmail,
  sendEmailVerificationEmail: () => sendEmailVerificationEmail,
  unverifyEmail: () => unverifyEmail,
  verifyEmailUsingToken: () => verifyEmailUsingToken
});
module.exports = __toCommonJS(emailverification_exports);
var import_recipe = __toESM(require("./recipe"), 1);
var import_error = __toESM(require("./error"), 1);
var import_emailVerificationClaim = require("./emailVerificationClaim");
var import_utils = require("./utils");
var import__ = require("../..");
var import_utils2 = require("../../utils");
var import_emailVerificationClaim2 = require("./emailVerificationClaim");
class Wrapper {
  static async createEmailVerificationToken(tenantId, recipeUserId, email, userContext) {
    const ctx = (0, import_utils2.getUserContext)(userContext);
    const recipeInstance = import_recipe.default.getInstanceOrThrowError();
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
    const ctx = (0, import_utils2.getUserContext)(userContext);
    const recipeInstance = import_recipe.default.getInstanceOrThrowError();
    const appInfo = recipeInstance.getAppInfo();
    let emailVerificationToken = await createEmailVerificationToken(tenantId, recipeUserId, email, ctx);
    if (emailVerificationToken.status === "EMAIL_ALREADY_VERIFIED_ERROR") {
      return {
        status: "EMAIL_ALREADY_VERIFIED_ERROR"
      };
    }
    return {
      status: "OK",
      link: (0, import_utils.getEmailVerifyLink)({
        appInfo,
        token: emailVerificationToken.token,
        tenantId,
        request: (0, import__.getRequestFromUserContext)(ctx),
        userContext: ctx
      })
    };
  }
  static async sendEmailVerificationEmail(tenantId, userId, recipeUserId, email, userContext) {
    const ctx = (0, import_utils2.getUserContext)(userContext);
    if (email === void 0) {
      const recipeInstance = import_recipe.default.getInstanceOrThrowError();
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
    return await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.verifyEmailUsingToken({
      token,
      tenantId,
      attemptAccountLinking,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static async isEmailVerified(recipeUserId, email, userContext) {
    const ctx = (0, import_utils2.getUserContext)(userContext);
    const recipeInstance = import_recipe.default.getInstanceOrThrowError();
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
    const ctx = (0, import_utils2.getUserContext)(userContext);
    const recipeInstance = import_recipe.default.getInstanceOrThrowError();
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
    const ctx = (0, import_utils2.getUserContext)(userContext);
    const recipeInstance = import_recipe.default.getInstanceOrThrowError();
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
    let recipeInstance = import_recipe.default.getInstanceOrThrowError();
    return await recipeInstance.emailDelivery.ingredientInterfaceImpl.sendEmail(__spreadProps(__spreadValues({}, input), {
      userContext: (0, import_utils2.getUserContext)(input.userContext)
    }));
  }
}
Wrapper.init = import_recipe.default.init;
Wrapper.Error = import_error.default;
Wrapper.EmailVerificationClaim = import_emailVerificationClaim.EmailVerificationClaim;
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EmailVerificationClaim,
  Error,
  createEmailVerificationLink,
  createEmailVerificationToken,
  init,
  isEmailVerified,
  revokeEmailVerificationTokens,
  sendEmail,
  sendEmailVerificationEmail,
  unverifyEmail,
  verifyEmailUsingToken
});
