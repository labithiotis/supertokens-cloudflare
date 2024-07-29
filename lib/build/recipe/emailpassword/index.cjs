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
var emailpassword_exports = {};
__export(emailpassword_exports, {
  Error: () => Error2,
  consumePasswordResetToken: () => consumePasswordResetToken,
  createResetPasswordLink: () => createResetPasswordLink,
  createResetPasswordToken: () => createResetPasswordToken,
  default: () => Wrapper,
  init: () => init,
  resetPasswordUsingToken: () => resetPasswordUsingToken,
  sendEmail: () => sendEmail,
  sendResetPasswordEmail: () => sendResetPasswordEmail,
  signIn: () => signIn,
  signUp: () => signUp,
  updateEmailOrPassword: () => updateEmailOrPassword,
  verifyCredentials: () => verifyCredentials
});
module.exports = __toCommonJS(emailpassword_exports);
var import_recipe = __toESM(require("./recipe"), 1);
var import_error = __toESM(require("./error"), 1);
var import_recipeUserId = __toESM(require("../../recipeUserId"), 1);
var import_constants = require("../multitenancy/constants");
var import_utils = require("./utils");
var import__ = require("../..");
var import_utils2 = require("../../utils");
const _Wrapper = class _Wrapper {
  static signUp(tenantId, email, password, session, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.signUp({
      email,
      password,
      session,
      tenantId: tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static signIn(tenantId, email, password, session, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.signIn({
      email,
      password,
      session,
      tenantId: tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static async verifyCredentials(tenantId, email, password, userContext) {
    const resp = await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.verifyCredentials({
      email,
      password,
      tenantId: tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
    return {
      status: resp.status
    };
  }
  /**
   * We do not make email optional here cause we want to
   * allow passing in primaryUserId. If we make email optional,
   * and if the user provides a primaryUserId, then it may result in two problems:
   *  - there is no recipeUserId = input primaryUserId, in this case,
   *    this function will throw an error
   *  - There is a recipe userId = input primaryUserId, but that recipe has no email,
   *    or has wrong email compared to what the user wanted to generate a reset token for.
   *
   * And we want to allow primaryUserId being passed in.
   */
  static createResetPasswordToken(tenantId, userId, email, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.createResetPasswordToken({
      userId,
      email,
      tenantId: tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static async resetPasswordUsingToken(tenantId, token, newPassword, userContext) {
    const consumeResp = await _Wrapper.consumePasswordResetToken(tenantId, token, userContext);
    if (consumeResp.status !== "OK") {
      return consumeResp;
    }
    let result = await _Wrapper.updateEmailOrPassword({
      recipeUserId: new import_recipeUserId.default(consumeResp.userId),
      email: consumeResp.email,
      password: newPassword,
      tenantIdForPasswordPolicy: tenantId,
      userContext
    });
    if (result.status === "EMAIL_ALREADY_EXISTS_ERROR" || result.status === "EMAIL_CHANGE_NOT_ALLOWED_ERROR") {
      throw new global.Error("Should never come here cause we are not updating email");
    }
    if (result.status === "PASSWORD_POLICY_VIOLATED_ERROR") {
      return {
        status: "PASSWORD_POLICY_VIOLATED_ERROR",
        failureReason: result.failureReason
      };
    }
    return {
      status: result.status
    };
  }
  static consumePasswordResetToken(tenantId, token, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.consumePasswordResetToken({
      token,
      tenantId: tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static updateEmailOrPassword(input) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.updateEmailOrPassword(__spreadProps(__spreadValues({}, input), {
      userContext: (0, import_utils2.getUserContext)(input.userContext),
      tenantIdForPasswordPolicy: input.tenantIdForPasswordPolicy === void 0 ? import_constants.DEFAULT_TENANT_ID : input.tenantIdForPasswordPolicy
    }));
  }
  static async createResetPasswordLink(tenantId, userId, email, userContext) {
    const ctx = (0, import_utils2.getUserContext)(userContext);
    let token = await createResetPasswordToken(tenantId, userId, email, ctx);
    if (token.status === "UNKNOWN_USER_ID_ERROR") {
      return token;
    }
    const recipeInstance = import_recipe.default.getInstanceOrThrowError();
    return {
      status: "OK",
      link: (0, import_utils.getPasswordResetLink)({
        appInfo: recipeInstance.getAppInfo(),
        token: token.token,
        tenantId: tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId,
        request: (0, import__.getRequestFromUserContext)(ctx),
        userContext: ctx
      })
    };
  }
  static async sendResetPasswordEmail(tenantId, userId, email, userContext) {
    const user = await (0, import__.getUser)(userId, userContext);
    if (!user) {
      return { status: "UNKNOWN_USER_ID_ERROR" };
    }
    const loginMethod = user.loginMethods.find((m) => m.recipeId === "emailpassword" && m.hasSameEmailAs(email));
    if (!loginMethod) {
      return { status: "UNKNOWN_USER_ID_ERROR" };
    }
    let link = await createResetPasswordLink(tenantId, userId, email, userContext);
    if (link.status === "UNKNOWN_USER_ID_ERROR") {
      return link;
    }
    await sendEmail({
      passwordResetLink: link.link,
      type: "PASSWORD_RESET",
      user: {
        id: user.id,
        recipeUserId: loginMethod.recipeUserId,
        email: loginMethod.email
      },
      tenantId,
      userContext
    });
    return {
      status: "OK"
    };
  }
  static async sendEmail(input) {
    let recipeInstance = import_recipe.default.getInstanceOrThrowError();
    return await recipeInstance.emailDelivery.ingredientInterfaceImpl.sendEmail(__spreadProps(__spreadValues({}, input), {
      tenantId: input.tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : input.tenantId,
      userContext: (0, import_utils2.getUserContext)(input.userContext)
    }));
  }
};
_Wrapper.init = import_recipe.default.init;
_Wrapper.Error = import_error.default;
let Wrapper = _Wrapper;
let init = Wrapper.init;
let Error2 = Wrapper.Error;
let signUp = Wrapper.signUp;
let signIn = Wrapper.signIn;
let verifyCredentials = Wrapper.verifyCredentials;
let createResetPasswordToken = Wrapper.createResetPasswordToken;
let resetPasswordUsingToken = Wrapper.resetPasswordUsingToken;
let consumePasswordResetToken = Wrapper.consumePasswordResetToken;
let updateEmailOrPassword = Wrapper.updateEmailOrPassword;
let createResetPasswordLink = Wrapper.createResetPasswordLink;
let sendResetPasswordEmail = Wrapper.sendResetPasswordEmail;
let sendEmail = Wrapper.sendEmail;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Error,
  consumePasswordResetToken,
  createResetPasswordLink,
  createResetPasswordToken,
  init,
  resetPasswordUsingToken,
  sendEmail,
  sendResetPasswordEmail,
  signIn,
  signUp,
  updateEmailOrPassword,
  verifyCredentials
});
