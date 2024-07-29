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
var accountlinking_exports = {};
__export(accountlinking_exports, {
  canCreatePrimaryUser: () => canCreatePrimaryUser,
  canLinkAccounts: () => canLinkAccounts,
  createPrimaryUser: () => createPrimaryUser,
  createPrimaryUserIdOrLinkAccounts: () => createPrimaryUserIdOrLinkAccounts,
  default: () => Wrapper,
  getPrimaryUserThatCanBeLinkedToRecipeUserId: () => getPrimaryUserThatCanBeLinkedToRecipeUserId,
  init: () => init,
  isEmailChangeAllowed: () => isEmailChangeAllowed,
  isSignInAllowed: () => isSignInAllowed,
  isSignUpAllowed: () => isSignUpAllowed,
  linkAccounts: () => linkAccounts,
  unlinkAccount: () => unlinkAccount
});
module.exports = __toCommonJS(accountlinking_exports);
var import_recipe = __toESM(require("./recipe"), 1);
var import__ = require("../..");
var import_utils = require("../../utils");
class Wrapper {
  /**
   * This is a function which is a combination of createPrimaryUser and
   * linkAccounts where the input recipeUserId is either linked to a user that it can be
   * linked to, or is made into a primary user.
   *
   * The output will be the user ID of the user that it was linked to, or it will be the
   * same as the input recipeUserId if it was made into a primary user, or if there was
   * no linking that happened.
   */
  static async createPrimaryUserIdOrLinkAccounts(tenantId, recipeUserId, session, userContext) {
    const user = await (0, import__.getUser)(recipeUserId.getAsString(), userContext);
    if (user === void 0) {
      throw new Error("Unknown recipeUserId");
    }
    const linkRes = await import_recipe.default.getInstance().tryLinkingByAccountInfoOrCreatePrimaryUser({
      tenantId,
      inputUser: user,
      session,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
    if (linkRes.status === "NO_LINK") {
      return user;
    }
    return linkRes.user;
  }
  /**
   * This function returns the primary user that the input recipe ID can be
   * linked to. It can be used to determine which primary account the linking
   * will happen to if the input recipe user ID was to be linked.
   *
   * If the function returns undefined, it means that there is no primary user
   * that the input recipe ID can be linked to, and therefore it can be made
   * into a primary user itself.
   */
  static async getPrimaryUserThatCanBeLinkedToRecipeUserId(tenantId, recipeUserId, userContext) {
    const user = await (0, import__.getUser)(recipeUserId.getAsString(), userContext);
    if (user === void 0) {
      throw new Error("Unknown recipeUserId");
    }
    return await import_recipe.default.getInstance().getPrimaryUserThatCanBeLinkedToRecipeUserId({
      tenantId,
      user,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async canCreatePrimaryUser(recipeUserId, userContext) {
    return await import_recipe.default.getInstance().recipeInterfaceImpl.canCreatePrimaryUser({
      recipeUserId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async createPrimaryUser(recipeUserId, userContext) {
    return await import_recipe.default.getInstance().recipeInterfaceImpl.createPrimaryUser({
      recipeUserId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async canLinkAccounts(recipeUserId, primaryUserId, userContext) {
    return await import_recipe.default.getInstance().recipeInterfaceImpl.canLinkAccounts({
      recipeUserId,
      primaryUserId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async linkAccounts(recipeUserId, primaryUserId, userContext) {
    return await import_recipe.default.getInstance().recipeInterfaceImpl.linkAccounts({
      recipeUserId,
      primaryUserId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async unlinkAccount(recipeUserId, userContext) {
    return await import_recipe.default.getInstance().recipeInterfaceImpl.unlinkAccount({
      recipeUserId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async isSignUpAllowed(tenantId, newUser, isVerified, session, userContext) {
    return await import_recipe.default.getInstance().isSignUpAllowed({
      newUser,
      isVerified,
      session,
      tenantId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async isSignInAllowed(tenantId, recipeUserId, session, userContext) {
    const user = await (0, import__.getUser)(recipeUserId.getAsString(), userContext);
    if (user === void 0) {
      throw new Error("Unknown recipeUserId");
    }
    return await import_recipe.default.getInstance().isSignInAllowed({
      user,
      accountInfo: user.loginMethods.find((lm) => lm.recipeUserId.getAsString() === recipeUserId.getAsString()),
      session,
      tenantId,
      signInVerifiesLoginMethod: false,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async isEmailChangeAllowed(recipeUserId, newEmail, isVerified, session, userContext) {
    const user = await (0, import__.getUser)(recipeUserId.getAsString(), userContext);
    const res = await import_recipe.default.getInstance().isEmailChangeAllowed({
      user,
      newEmail,
      isVerified,
      session,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
    return res.allowed;
  }
}
Wrapper.init = import_recipe.default.init;
const init = Wrapper.init;
const canCreatePrimaryUser = Wrapper.canCreatePrimaryUser;
const createPrimaryUser = Wrapper.createPrimaryUser;
const canLinkAccounts = Wrapper.canLinkAccounts;
const linkAccounts = Wrapper.linkAccounts;
const unlinkAccount = Wrapper.unlinkAccount;
const createPrimaryUserIdOrLinkAccounts = Wrapper.createPrimaryUserIdOrLinkAccounts;
const getPrimaryUserThatCanBeLinkedToRecipeUserId = Wrapper.getPrimaryUserThatCanBeLinkedToRecipeUserId;
const isSignUpAllowed = Wrapper.isSignUpAllowed;
const isSignInAllowed = Wrapper.isSignInAllowed;
const isEmailChangeAllowed = Wrapper.isEmailChangeAllowed;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  canCreatePrimaryUser,
  canLinkAccounts,
  createPrimaryUser,
  createPrimaryUserIdOrLinkAccounts,
  getPrimaryUserThatCanBeLinkedToRecipeUserId,
  init,
  isEmailChangeAllowed,
  isSignInAllowed,
  isSignUpAllowed,
  linkAccounts,
  unlinkAccount
});
