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
import RecipeUserId from "../../recipeUserId";
import { DEFAULT_TENANT_ID } from "../multitenancy/constants";
import { getPasswordResetLink } from "./utils";
import { getRequestFromUserContext, getUser } from "../..";
import { getUserContext } from "../../utils";
const _Wrapper = class _Wrapper {
  static signUp(tenantId, email, password, session, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.signUp({
      email,
      password,
      session,
      tenantId: tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId,
      userContext: getUserContext(userContext)
    });
  }
  static signIn(tenantId, email, password, session, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.signIn({
      email,
      password,
      session,
      tenantId: tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId,
      userContext: getUserContext(userContext)
    });
  }
  static async verifyCredentials(tenantId, email, password, userContext) {
    const resp = await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.verifyCredentials({
      email,
      password,
      tenantId: tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId,
      userContext: getUserContext(userContext)
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
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.createResetPasswordToken({
      userId,
      email,
      tenantId: tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId,
      userContext: getUserContext(userContext)
    });
  }
  static async resetPasswordUsingToken(tenantId, token, newPassword, userContext) {
    const consumeResp = await _Wrapper.consumePasswordResetToken(tenantId, token, userContext);
    if (consumeResp.status !== "OK") {
      return consumeResp;
    }
    let result = await _Wrapper.updateEmailOrPassword({
      recipeUserId: new RecipeUserId(consumeResp.userId),
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
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.consumePasswordResetToken({
      token,
      tenantId: tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId,
      userContext: getUserContext(userContext)
    });
  }
  static updateEmailOrPassword(input) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.updateEmailOrPassword(__spreadProps(__spreadValues({}, input), {
      userContext: getUserContext(input.userContext),
      tenantIdForPasswordPolicy: input.tenantIdForPasswordPolicy === void 0 ? DEFAULT_TENANT_ID : input.tenantIdForPasswordPolicy
    }));
  }
  static async createResetPasswordLink(tenantId, userId, email, userContext) {
    const ctx = getUserContext(userContext);
    let token = await createResetPasswordToken(tenantId, userId, email, ctx);
    if (token.status === "UNKNOWN_USER_ID_ERROR") {
      return token;
    }
    const recipeInstance = Recipe.getInstanceOrThrowError();
    return {
      status: "OK",
      link: getPasswordResetLink({
        appInfo: recipeInstance.getAppInfo(),
        token: token.token,
        tenantId: tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId,
        request: getRequestFromUserContext(ctx),
        userContext: ctx
      })
    };
  }
  static async sendResetPasswordEmail(tenantId, userId, email, userContext) {
    const user = await getUser(userId, userContext);
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
    let recipeInstance = Recipe.getInstanceOrThrowError();
    return await recipeInstance.emailDelivery.ingredientInterfaceImpl.sendEmail(__spreadProps(__spreadValues({}, input), {
      tenantId: input.tenantId === void 0 ? DEFAULT_TENANT_ID : input.tenantId,
      userContext: getUserContext(input.userContext)
    }));
  }
};
_Wrapper.init = Recipe.init;
_Wrapper.Error = SuperTokensError;
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
export {
  Error2 as Error,
  consumePasswordResetToken,
  createResetPasswordLink,
  createResetPasswordToken,
  Wrapper as default,
  init,
  resetPasswordUsingToken,
  sendEmail,
  sendResetPasswordEmail,
  signIn,
  signUp,
  updateEmailOrPassword,
  verifyCredentials
};
