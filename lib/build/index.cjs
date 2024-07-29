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
var ts_exports = {};
__export(ts_exports, {
  Error: () => Error2,
  RecipeUserId: () => import_recipeUserId2.default,
  User: () => import_user2.User,
  convertToRecipeUserId: () => convertToRecipeUserId,
  createUserIdMapping: () => createUserIdMapping,
  default: () => SuperTokensWrapper,
  deleteUser: () => deleteUser,
  deleteUserIdMapping: () => deleteUserIdMapping,
  getAllCORSHeaders: () => getAllCORSHeaders,
  getRequestFromUserContext: () => getRequestFromUserContext,
  getUser: () => getUser,
  getUserCount: () => getUserCount,
  getUserIdMapping: () => getUserIdMapping,
  getUsersNewestFirst: () => getUsersNewestFirst,
  getUsersOldestFirst: () => getUsersOldestFirst,
  init: () => init,
  listUsersByAccountInfo: () => listUsersByAccountInfo,
  updateOrDeleteUserIdMappingInfo: () => updateOrDeleteUserIdMappingInfo
});
module.exports = __toCommonJS(ts_exports);
var import_supertokens = __toESM(require("./supertokens"), 1);
var import_error = __toESM(require("./error"), 1);
var import_recipe = __toESM(require("./recipe/accountlinking/recipe"), 1);
var import_recipeUserId = __toESM(require("./recipeUserId"), 1);
var import_user = require("./user");
var import_utils = require("./utils");
var import_recipeUserId2 = __toESM(require("./recipeUserId"), 1);
var import_user2 = require("./user");
class SuperTokensWrapper {
  static getAllCORSHeaders() {
    return import_supertokens.default.getInstanceOrThrowError().getAllCORSHeaders();
  }
  static getUserCount(includeRecipeIds, tenantId, userContext) {
    return import_supertokens.default.getInstanceOrThrowError().getUserCount(
      includeRecipeIds,
      tenantId,
      (0, import_utils.getUserContext)(userContext)
    );
  }
  static getUsersOldestFirst(input) {
    return import_recipe.default.getInstance().recipeInterfaceImpl.getUsers(__spreadProps(__spreadValues({
      timeJoinedOrder: "ASC"
    }, input), {
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  static getUsersNewestFirst(input) {
    return import_recipe.default.getInstance().recipeInterfaceImpl.getUsers(__spreadProps(__spreadValues({
      timeJoinedOrder: "DESC"
    }, input), {
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  static createUserIdMapping(input) {
    return import_supertokens.default.getInstanceOrThrowError().createUserIdMapping(__spreadProps(__spreadValues({}, input), {
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  static getUserIdMapping(input) {
    return import_supertokens.default.getInstanceOrThrowError().getUserIdMapping(__spreadProps(__spreadValues({}, input), {
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  static deleteUserIdMapping(input) {
    return import_supertokens.default.getInstanceOrThrowError().deleteUserIdMapping(__spreadProps(__spreadValues({}, input), {
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  static updateOrDeleteUserIdMappingInfo(input) {
    return import_supertokens.default.getInstanceOrThrowError().updateOrDeleteUserIdMappingInfo(__spreadProps(__spreadValues({}, input), {
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  static async getUser(userId, userContext) {
    return await import_recipe.default.getInstance().recipeInterfaceImpl.getUser({
      userId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async listUsersByAccountInfo(tenantId, accountInfo, doUnionOfAccountInfo = false, userContext) {
    return await import_recipe.default.getInstance().recipeInterfaceImpl.listUsersByAccountInfo({
      tenantId,
      accountInfo,
      doUnionOfAccountInfo,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async deleteUser(userId, removeAllLinkedAccounts = true, userContext) {
    return await import_recipe.default.getInstance().recipeInterfaceImpl.deleteUser({
      userId,
      removeAllLinkedAccounts,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static convertToRecipeUserId(recipeUserId) {
    return new import_recipeUserId.default(recipeUserId);
  }
  static getRequestFromUserContext(userContext) {
    return import_supertokens.default.getInstanceOrThrowError().getRequestFromUserContext(userContext);
  }
}
SuperTokensWrapper.init = import_supertokens.default.init;
SuperTokensWrapper.Error = import_error.default;
SuperTokensWrapper.RecipeUserId = import_recipeUserId.default;
SuperTokensWrapper.User = import_user.User;
let init = SuperTokensWrapper.init;
let getAllCORSHeaders = SuperTokensWrapper.getAllCORSHeaders;
let getUserCount = SuperTokensWrapper.getUserCount;
let getUsersOldestFirst = SuperTokensWrapper.getUsersOldestFirst;
let getUsersNewestFirst = SuperTokensWrapper.getUsersNewestFirst;
let deleteUser = SuperTokensWrapper.deleteUser;
let createUserIdMapping = SuperTokensWrapper.createUserIdMapping;
let getUserIdMapping = SuperTokensWrapper.getUserIdMapping;
let deleteUserIdMapping = SuperTokensWrapper.deleteUserIdMapping;
let updateOrDeleteUserIdMappingInfo = SuperTokensWrapper.updateOrDeleteUserIdMappingInfo;
let getUser = SuperTokensWrapper.getUser;
let listUsersByAccountInfo = SuperTokensWrapper.listUsersByAccountInfo;
let convertToRecipeUserId = SuperTokensWrapper.convertToRecipeUserId;
let getRequestFromUserContext = SuperTokensWrapper.getRequestFromUserContext;
let Error2 = SuperTokensWrapper.Error;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Error,
  RecipeUserId,
  User,
  convertToRecipeUserId,
  createUserIdMapping,
  deleteUser,
  deleteUserIdMapping,
  getAllCORSHeaders,
  getRequestFromUserContext,
  getUser,
  getUserCount,
  getUserIdMapping,
  getUsersNewestFirst,
  getUsersOldestFirst,
  init,
  listUsersByAccountInfo,
  updateOrDeleteUserIdMappingInfo
});
