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
  default: () => getRecipeInterface
});
module.exports = __toCommonJS(recipeImplementation_exports);
var import_recipe = __toESM(require("../accountlinking/recipe"), 1);
var import_recipe2 = __toESM(require("../emailverification/recipe"), 1);
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import_logger = require("../../logger");
var import_user = require("../../user");
var import__ = require("../..");
var import_recipeUserId = __toESM(require("../../recipeUserId"), 1);
var import_authUtils = require("../../authUtils");
function getRecipeInterface(querier) {
  function copyAndRemoveUserContextAndTenantId(input) {
    let result = __spreadValues({}, input);
    delete result.userContext;
    delete result.tenantId;
    delete result.session;
    if (result.recipeUserId !== void 0 && result.recipeUserId.getAsString !== void 0) {
      result.recipeUserId = result.recipeUserId.getAsString();
    }
    return result;
  }
  return {
    consumeCode: async function(input) {
      const response = await querier.sendPostRequest(
        new import_normalisedURLPath.default(`/${input.tenantId}/recipe/signinup/code/consume`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      if (response.status !== "OK") {
        return response;
      }
      (0, import_logger.logDebugMessage)("Passwordless.consumeCode code consumed OK");
      response.user = new import_user.User(response.user);
      response.recipeUserId = new import_recipeUserId.default(response.recipeUserId);
      if (response.status !== "OK") {
        return response;
      }
      if (response.status !== "OK") {
        return response;
      }
      let updatedUser = response.user;
      const linkResult = await import_authUtils.AuthUtils.linkToSessionIfProvidedElseCreatePrimaryUserIdOrLinkByAccountInfo({
        tenantId: input.tenantId,
        inputUser: response.user,
        recipeUserId: response.recipeUserId,
        session: input.session,
        userContext: input.userContext
      });
      if (linkResult.status !== "OK") {
        return linkResult;
      }
      updatedUser = linkResult.user;
      if (updatedUser === void 0) {
        throw new Error("Should never come here.");
      }
      response.user = updatedUser;
      return __spreadProps(__spreadValues({}, response), {
        consumedDevice: response.consumedDevice,
        createdNewRecipeUser: response.createdNewUser,
        user: response.user,
        recipeUserId: response.recipeUserId
      });
    },
    checkCode: async function(input) {
      let response = await querier.sendPostRequest(
        new import_normalisedURLPath.default(`/${input.tenantId}/recipe/signinup/code/check`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      if (response.status !== "OK") {
        return response;
      }
      (0, import_logger.logDebugMessage)("Passwordless.checkCode code verified");
      return response;
    },
    createCode: async function(input) {
      let response = await querier.sendPostRequest(
        new import_normalisedURLPath.default(`/${input.tenantId}/recipe/signinup/code`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      return response;
    },
    createNewCodeForDevice: async function(input) {
      let response = await querier.sendPostRequest(
        new import_normalisedURLPath.default(`/${input.tenantId}/recipe/signinup/code`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      return response;
    },
    listCodesByDeviceId: async function(input) {
      let response = await querier.sendGetRequest(
        new import_normalisedURLPath.default(`/${input.tenantId}/recipe/signinup/codes`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      return response.devices.length === 1 ? response.devices[0] : void 0;
    },
    listCodesByEmail: async function(input) {
      let response = await querier.sendGetRequest(
        new import_normalisedURLPath.default(`/${input.tenantId}/recipe/signinup/codes`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      return response.devices;
    },
    listCodesByPhoneNumber: async function(input) {
      let response = await querier.sendGetRequest(
        new import_normalisedURLPath.default(`/${input.tenantId}/recipe/signinup/codes`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      return response.devices;
    },
    listCodesByPreAuthSessionId: async function(input) {
      let response = await querier.sendGetRequest(
        new import_normalisedURLPath.default(`/${input.tenantId}/recipe/signinup/codes`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      return response.devices.length === 1 ? response.devices[0] : void 0;
    },
    revokeAllCodes: async function(input) {
      await querier.sendPostRequest(
        new import_normalisedURLPath.default(`/${input.tenantId}/recipe/signinup/codes/remove`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      return {
        status: "OK"
      };
    },
    revokeCode: async function(input) {
      await querier.sendPostRequest(
        new import_normalisedURLPath.default(`/${input.tenantId}/recipe/signinup/code/remove`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      return { status: "OK" };
    },
    updateUser: async function(input) {
      const accountLinking = import_recipe.default.getInstance();
      if (input.email) {
        const user2 = await (0, import__.getUser)(input.recipeUserId.getAsString(), input.userContext);
        if (user2 === void 0) {
          return { status: "UNKNOWN_USER_ID_ERROR" };
        }
        const evInstance = import_recipe2.default.getInstance();
        let isEmailVerified = false;
        if (evInstance) {
          isEmailVerified = await evInstance.recipeInterfaceImpl.isEmailVerified({
            recipeUserId: input.recipeUserId,
            email: input.email,
            userContext: input.userContext
          });
        }
        const isEmailChangeAllowed = await accountLinking.isEmailChangeAllowed({
          user: user2,
          isVerified: isEmailVerified,
          newEmail: input.email,
          session: void 0,
          userContext: input.userContext
        });
        if (!isEmailChangeAllowed.allowed) {
          return {
            status: "EMAIL_CHANGE_NOT_ALLOWED_ERROR",
            reason: isEmailChangeAllowed.reason === "ACCOUNT_TAKEOVER_RISK" ? "New email cannot be applied to existing account because of account takeover risks." : "New email cannot be applied to existing account because of there is another primary user with the same email address."
          };
        }
      }
      let response = await querier.sendPutRequest(
        new import_normalisedURLPath.default(`/recipe/user`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      if (response.status !== "OK") {
        return response;
      }
      const user = await (0, import__.getUser)(input.recipeUserId.getAsString(), input.userContext);
      if (user === void 0) {
        return {
          status: "UNKNOWN_USER_ID_ERROR"
        };
      }
      await import_recipe.default.getInstance().verifyEmailForRecipeUserIfLinkedAccountsAreVerified({
        user,
        recipeUserId: input.recipeUserId,
        userContext: input.userContext
      });
      return response;
    }
  };
}
