var __defProp = Object.defineProperty;
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
import NormalisedURLPath from "../../normalisedURLPath";
import { User } from "../../user";
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
        new NormalisedURLPath(`${tenantId != null ? tenantId : "public"}/users`),
        __spreadValues({
          includeRecipeIds: includeRecipeIdsStr,
          timeJoinedOrder,
          limit,
          paginationToken
        }, query),
        userContext
      );
      return {
        users: response.users.map((u) => new User(u)),
        nextPaginationToken: response.nextPaginationToken
      };
    },
    canCreatePrimaryUser: async function({
      recipeUserId,
      userContext
    }) {
      return await querier.sendGetRequest(
        new NormalisedURLPath("/recipe/accountlinking/user/primary/check"),
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
        new NormalisedURLPath("/recipe/accountlinking/user/primary"),
        {
          recipeUserId: recipeUserId.getAsString()
        },
        userContext
      );
      if (response.status === "OK") {
        response.user = new User(response.user);
      }
      return response;
    },
    canLinkAccounts: async function({
      recipeUserId,
      primaryUserId,
      userContext
    }) {
      let result = await querier.sendGetRequest(
        new NormalisedURLPath("/recipe/accountlinking/user/link/check"),
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
        new NormalisedURLPath("/recipe/accountlinking/user/link"),
        {
          recipeUserId: recipeUserId.getAsString(),
          primaryUserId
        },
        userContext
      );
      if (["OK", "RECIPE_USER_ID_ALREADY_LINKED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR"].includes(
        accountsLinkingResult.status
      )) {
        accountsLinkingResult.user = new User(accountsLinkingResult.user);
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
        new NormalisedURLPath("/recipe/accountlinking/user/unlink"),
        {
          recipeUserId: recipeUserId.getAsString()
        },
        userContext
      );
      return accountsUnlinkingResult;
    },
    getUser: async function({ userId, userContext }) {
      let result = await querier.sendGetRequest(
        new NormalisedURLPath("/user/id"),
        {
          userId
        },
        userContext
      );
      if (result.status === "OK") {
        return new User(result.user);
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
        new NormalisedURLPath(`${tenantId != null ? tenantId : "public"}/users/by-accountinfo`),
        {
          email: accountInfo.email,
          phoneNumber: accountInfo.phoneNumber,
          thirdPartyId: (_a = accountInfo.thirdParty) == null ? void 0 : _a.id,
          thirdPartyUserId: (_b = accountInfo.thirdParty) == null ? void 0 : _b.userId,
          doUnionOfAccountInfo
        },
        userContext
      );
      return result.users.map((u) => new User(u));
    },
    deleteUser: async function({
      userId,
      removeAllLinkedAccounts,
      userContext
    }) {
      return await querier.sendPostRequest(
        new NormalisedURLPath("/user/remove"),
        {
          userId,
          removeAllLinkedAccounts
        },
        userContext
      );
    }
  };
}
export {
  getRecipeImplementation as default
};
