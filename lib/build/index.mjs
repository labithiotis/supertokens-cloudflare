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
import SuperTokens from "./supertokens";
import SuperTokensError from "./error";
import AccountLinking from "./recipe/accountlinking/recipe";
import RecipeUserId from "./recipeUserId";
import { User } from "./user";
import { getUserContext } from "./utils";
class SuperTokensWrapper {
  static getAllCORSHeaders() {
    return SuperTokens.getInstanceOrThrowError().getAllCORSHeaders();
  }
  static getUserCount(includeRecipeIds, tenantId, userContext) {
    return SuperTokens.getInstanceOrThrowError().getUserCount(
      includeRecipeIds,
      tenantId,
      getUserContext(userContext)
    );
  }
  static getUsersOldestFirst(input) {
    return AccountLinking.getInstance().recipeInterfaceImpl.getUsers(__spreadProps(__spreadValues({
      timeJoinedOrder: "ASC"
    }, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
  static getUsersNewestFirst(input) {
    return AccountLinking.getInstance().recipeInterfaceImpl.getUsers(__spreadProps(__spreadValues({
      timeJoinedOrder: "DESC"
    }, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
  static createUserIdMapping(input) {
    return SuperTokens.getInstanceOrThrowError().createUserIdMapping(__spreadProps(__spreadValues({}, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
  static getUserIdMapping(input) {
    return SuperTokens.getInstanceOrThrowError().getUserIdMapping(__spreadProps(__spreadValues({}, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
  static deleteUserIdMapping(input) {
    return SuperTokens.getInstanceOrThrowError().deleteUserIdMapping(__spreadProps(__spreadValues({}, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
  static updateOrDeleteUserIdMappingInfo(input) {
    return SuperTokens.getInstanceOrThrowError().updateOrDeleteUserIdMappingInfo(__spreadProps(__spreadValues({}, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
  static async getUser(userId, userContext) {
    return await AccountLinking.getInstance().recipeInterfaceImpl.getUser({
      userId,
      userContext: getUserContext(userContext)
    });
  }
  static async listUsersByAccountInfo(tenantId, accountInfo, doUnionOfAccountInfo = false, userContext) {
    return await AccountLinking.getInstance().recipeInterfaceImpl.listUsersByAccountInfo({
      tenantId,
      accountInfo,
      doUnionOfAccountInfo,
      userContext: getUserContext(userContext)
    });
  }
  static async deleteUser(userId, removeAllLinkedAccounts = true, userContext) {
    return await AccountLinking.getInstance().recipeInterfaceImpl.deleteUser({
      userId,
      removeAllLinkedAccounts,
      userContext: getUserContext(userContext)
    });
  }
  static convertToRecipeUserId(recipeUserId) {
    return new RecipeUserId(recipeUserId);
  }
  static getRequestFromUserContext(userContext) {
    return SuperTokens.getInstanceOrThrowError().getRequestFromUserContext(userContext);
  }
}
SuperTokensWrapper.init = SuperTokens.init;
SuperTokensWrapper.Error = SuperTokensError;
SuperTokensWrapper.RecipeUserId = RecipeUserId;
SuperTokensWrapper.User = User;
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
import { default as default2 } from "./recipeUserId";
import { User as User2 } from "./user";
export {
  Error2 as Error,
  default2 as RecipeUserId,
  User2 as User,
  convertToRecipeUserId,
  createUserIdMapping,
  SuperTokensWrapper as default,
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
};
