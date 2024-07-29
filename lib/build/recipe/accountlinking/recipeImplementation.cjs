"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
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
var recipeImplementation_exports = {};
__export(recipeImplementation_exports, {
  default: () => getRecipeImplementation
});
module.exports = __toCommonJS(recipeImplementation_exports);
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import_user = require("../../user");
function getRecipeImplementation(querier, config, recipeInstance) {
  return {
    getUsers: async function({
      tenantId,
      timeJoinedOrder,
      limit,
      paginationToken,
      includeRecipeIds,
      query,
      userContext
    }) {
      let includeRecipeIdsStr = void 0;
      if (includeRecipeIds !== void 0) {
        includeRecipeIdsStr = includeRecipeIds.join(",");
      }
      let response = await querier.sendGetRequest(
        new import_normalisedURLPath.default(`${tenantId != null ? tenantId : "public"}/users`),
        __spreadValues({
          includeRecipeIds: includeRecipeIdsStr,
          timeJoinedOrder,
          limit,
          paginationToken
        }, query),
        userContext
      );
      return {
        users: response.users.map((u) => new import_user.User(u)),
        nextPaginationToken: response.nextPaginationToken
      };
    },
    canCreatePrimaryUser: async function({
      recipeUserId,
      userContext
    }) {
      return await querier.sendGetRequest(
        new import_normalisedURLPath.default("/recipe/accountlinking/user/primary/check"),
        {
          recipeUserId: recipeUserId.getAsString()
        },
        userContext
      );
    },
    createPrimaryUser: async function({
      recipeUserId,
      userContext
    }) {
      let response = await querier.sendPostRequest(
        new import_normalisedURLPath.default("/recipe/accountlinking/user/primary"),
        {
          recipeUserId: recipeUserId.getAsString()
        },
        userContext
      );
      if (response.status === "OK") {
        response.user = new import_user.User(response.user);
      }
      return response;
    },
    canLinkAccounts: async function({
      recipeUserId,
      primaryUserId,
      userContext
    }) {
      let result = await querier.sendGetRequest(
        new import_normalisedURLPath.default("/recipe/accountlinking/user/link/check"),
        {
          recipeUserId: recipeUserId.getAsString(),
          primaryUserId
        },
        userContext
      );
      return result;
    },
    linkAccounts: async function({
      recipeUserId,
      primaryUserId,
      userContext
    }) {
      const accountsLinkingResult = await querier.sendPostRequest(
        new import_normalisedURLPath.default("/recipe/accountlinking/user/link"),
        {
          recipeUserId: recipeUserId.getAsString(),
          primaryUserId
        },
        userContext
      );
      if (["OK", "RECIPE_USER_ID_ALREADY_LINKED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR"].includes(
        accountsLinkingResult.status
      )) {
        accountsLinkingResult.user = new import_user.User(accountsLinkingResult.user);
      }
      if (accountsLinkingResult.status === "OK") {
        let user = accountsLinkingResult.user;
        if (!accountsLinkingResult.accountsAlreadyLinked) {
          await recipeInstance.verifyEmailForRecipeUserIfLinkedAccountsAreVerified({
            user,
            recipeUserId,
            userContext
          });
          const updatedUser = await this.getUser({
            userId: primaryUserId,
            userContext
          });
          if (updatedUser === void 0) {
            throw Error("this error should never be thrown");
          }
          user = updatedUser;
          let loginMethodInfo = user.loginMethods.find(
            (u) => u.recipeUserId.getAsString() === recipeUserId.getAsString()
          );
          if (loginMethodInfo === void 0) {
            throw Error("this error should never be thrown");
          }
          await config.onAccountLinked(user, loginMethodInfo, userContext);
        }
        accountsLinkingResult.user = user;
      }
      return accountsLinkingResult;
    },
    unlinkAccount: async function({
      recipeUserId,
      userContext
    }) {
      let accountsUnlinkingResult = await querier.sendPostRequest(
        new import_normalisedURLPath.default("/recipe/accountlinking/user/unlink"),
        {
          recipeUserId: recipeUserId.getAsString()
        },
        userContext
      );
      return accountsUnlinkingResult;
    },
    getUser: async function({ userId, userContext }) {
      let result = await querier.sendGetRequest(
        new import_normalisedURLPath.default("/user/id"),
        {
          userId
        },
        userContext
      );
      if (result.status === "OK") {
        return new import_user.User(result.user);
      }
      return void 0;
    },
    listUsersByAccountInfo: async function({
      tenantId,
      accountInfo,
      doUnionOfAccountInfo,
      userContext
    }) {
      var _a, _b;
      let result = await querier.sendGetRequest(
        new import_normalisedURLPath.default(`${tenantId != null ? tenantId : "public"}/users/by-accountinfo`),
        {
          email: accountInfo.email,
          phoneNumber: accountInfo.phoneNumber,
          thirdPartyId: (_a = accountInfo.thirdParty) == null ? void 0 : _a.id,
          thirdPartyUserId: (_b = accountInfo.thirdParty) == null ? void 0 : _b.userId,
          doUnionOfAccountInfo
        },
        userContext
      );
      return result.users.map((u) => new import_user.User(u));
    },
    deleteUser: async function({
      userId,
      removeAllLinkedAccounts,
      userContext
    }) {
      return await querier.sendPostRequest(
        new import_normalisedURLPath.default("/user/remove"),
        {
          userId,
          removeAllLinkedAccounts
        },
        userContext
      );
    }
  };
}
