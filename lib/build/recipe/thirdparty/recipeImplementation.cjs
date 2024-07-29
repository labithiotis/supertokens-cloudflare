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
var recipeImplementation_exports = {};
__export(recipeImplementation_exports, {
  default: () => getRecipeImplementation
});
module.exports = __toCommonJS(recipeImplementation_exports);
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import_configUtils = require("./providers/configUtils");
var import_recipe = __toESM(require("../accountlinking/recipe"), 1);
var import_recipe2 = __toESM(require("../multitenancy/recipe"), 1);
var import_recipeUserId = __toESM(require("../../recipeUserId"), 1);
var import__ = require("../..");
var import_user = require("../../user");
var import_authUtils = require("../../authUtils");
var import_constants = require("../multitenancy/constants");
function getRecipeImplementation(querier, providers) {
  return {
    manuallyCreateOrUpdateUser: async function({ thirdPartyId, thirdPartyUserId, email, isVerified, tenantId, session, userContext }) {
      const accountLinking = import_recipe.default.getInstance();
      const users = await (0, import__.listUsersByAccountInfo)(
        tenantId,
        { thirdParty: { id: thirdPartyId, userId: thirdPartyUserId } },
        false,
        userContext
      );
      const user = users[0];
      if (user !== void 0) {
        const isEmailChangeAllowed = await accountLinking.isEmailChangeAllowed({
          user,
          isVerified,
          newEmail: email,
          session,
          userContext
        });
        if (!isEmailChangeAllowed.allowed) {
          return {
            status: "EMAIL_CHANGE_NOT_ALLOWED_ERROR",
            reason: isEmailChangeAllowed.reason === "PRIMARY_USER_CONFLICT" ? "Email already associated with another primary user." : "New email cannot be applied to existing account because of account takeover risks."
          };
        }
      }
      let response = await querier.sendPostRequest(
        new import_normalisedURLPath.default(`/${tenantId}/recipe/signinup`),
        {
          thirdPartyId,
          thirdPartyUserId,
          email: { id: email, isVerified }
        },
        userContext
      );
      if (response.status !== "OK") {
        return response;
      }
      response.user = new import_user.User(response.user);
      response.recipeUserId = new import_recipeUserId.default(response.recipeUserId);
      await import_recipe.default.getInstance().verifyEmailForRecipeUserIfLinkedAccountsAreVerified({
        user: response.user,
        recipeUserId: response.recipeUserId,
        userContext
      });
      response.user = await (0, import__.getUser)(response.recipeUserId.getAsString(), userContext);
      const linkResult = await import_authUtils.AuthUtils.linkToSessionIfProvidedElseCreatePrimaryUserIdOrLinkByAccountInfo({
        tenantId,
        inputUser: response.user,
        recipeUserId: response.recipeUserId,
        session,
        userContext
      });
      if (linkResult.status !== "OK") {
        return linkResult;
      }
      return {
        status: "OK",
        createdNewRecipeUser: response.createdNewUser,
        user: linkResult.user,
        recipeUserId: response.recipeUserId
      };
    },
    signInUp: async function({
      thirdPartyId,
      thirdPartyUserId,
      email,
      isVerified,
      tenantId,
      userContext,
      oAuthTokens,
      session,
      rawUserInfoFromProvider
    }) {
      let response = await this.manuallyCreateOrUpdateUser({
        thirdPartyId,
        thirdPartyUserId,
        email,
        tenantId,
        isVerified,
        session,
        userContext
      });
      if (response.status === "EMAIL_CHANGE_NOT_ALLOWED_ERROR") {
        return {
          status: "SIGN_IN_UP_NOT_ALLOWED",
          reason: response.reason === "Email already associated with another primary user." ? "Cannot sign in / up because new email cannot be applied to existing account. Please contact support. (ERR_CODE_005)" : "Cannot sign in / up because new email cannot be applied to existing account. Please contact support. (ERR_CODE_024)"
        };
      }
      if (response.status === "OK") {
        return __spreadProps(__spreadValues({}, response), {
          oAuthTokens,
          rawUserInfoFromProvider
        });
      }
      return response;
    },
    getProvider: async function({ thirdPartyId, tenantId, clientType, userContext }) {
      const mtRecipe = import_recipe2.default.getInstanceOrThrowError();
      const tenantConfig = await mtRecipe.recipeInterfaceImpl.getTenant({ tenantId, userContext });
      if (tenantConfig === void 0) {
        throw new Error("Tenant not found");
      }
      const mergedProviders = (0, import_configUtils.mergeProvidersFromCoreAndStatic)(
        tenantConfig.thirdParty.providers,
        providers,
        tenantId === import_constants.DEFAULT_TENANT_ID
      );
      const provider = await (0, import_configUtils.findAndCreateProviderInstance)(
        mergedProviders,
        thirdPartyId,
        clientType,
        userContext
      );
      return provider;
    }
  };
}
