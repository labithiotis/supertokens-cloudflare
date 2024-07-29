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
  default: () => getRecipeInterface
});
module.exports = __toCommonJS(recipeImplementation_exports);
var import_jose = require("jose");
var SessionFunctions = __toESM(require("./sessionFunctions"), 1);
var import_cookieAndHeaders = require("./cookieAndHeaders");
var import_utils = require("./utils");
var import_sessionClass = __toESM(require("./sessionClass"), 1);
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import_logger = require("../../logger");
var import_jwt = require("./jwt");
var import_accessToken = require("./accessToken");
var import_error = __toESM(require("./error"), 1);
var import_recipeUserId = __toESM(require("../../recipeUserId"), 1);
var import_constants = require("../multitenancy/constants");
var import_constants2 = require("./constants");
var import_node_process = require("node:process");
function getRecipeInterface(querier, config, appInfo, getRecipeImplAfterOverrides) {
  const JWKS = querier.getAllCoreUrlsForPath("/.well-known/jwks.json").map(
    (url) => (0, import_jose.createRemoteJWKSet)(new URL(url), {
      cooldownDuration: import_constants2.JWKCacheCooldownInMs,
      cacheMaxAge: config.jwksRefreshIntervalSec * 1e3
    })
  );
  const combinedJWKS = async (...args) => {
    let lastError = void 0;
    if (JWKS.length === 0) {
      throw Error(
        "No SuperTokens core available to query. Please pass supertokens > connectionURI to the init function, or override all the functions of the recipe you are using."
      );
    }
    for (const jwks of JWKS) {
      try {
        return await jwks(...args);
      } catch (ex) {
        lastError = ex;
      }
    }
    throw lastError;
  };
  let obj = {
    createNewSession: async function({
      recipeUserId,
      accessTokenPayload = {},
      sessionDataInDatabase = {},
      disableAntiCsrf,
      tenantId,
      userContext
    }) {
      (0, import_logger.logDebugMessage)("createNewSession: Started");
      let response = await SessionFunctions.createNewSession(
        helpers,
        tenantId,
        recipeUserId,
        disableAntiCsrf === true,
        accessTokenPayload,
        sessionDataInDatabase,
        userContext
      );
      (0, import_logger.logDebugMessage)("createNewSession: Finished");
      const payload = (0, import_jwt.parseJWTWithoutSignatureVerification)(response.accessToken.token).payload;
      return new import_sessionClass.default(
        helpers,
        response.accessToken.token,
        (0, import_cookieAndHeaders.buildFrontToken)(response.session.userId, response.accessToken.expiry, payload),
        response.refreshToken,
        response.antiCsrfToken,
        response.session.handle,
        response.session.userId,
        response.session.recipeUserId,
        payload,
        void 0,
        true,
        tenantId
      );
    },
    getGlobalClaimValidators: async function(input) {
      return input.claimValidatorsAddedByOtherRecipes;
    },
    getSession: async function({
      accessToken: accessTokenString,
      antiCsrfToken,
      options,
      userContext
    }) {
      if ((options == null ? void 0 : options.antiCsrfCheck) !== false && typeof config.antiCsrfFunctionOrString === "string" && config.antiCsrfFunctionOrString === "VIA_CUSTOM_HEADER") {
        throw new Error(
          "Since the anti-csrf mode is VIA_CUSTOM_HEADER getSession can't check the CSRF token. Please either use VIA_TOKEN or set antiCsrfCheck to false"
        );
      }
      (0, import_logger.logDebugMessage)("getSession: Started");
      if (accessTokenString === void 0) {
        if ((options == null ? void 0 : options.sessionRequired) === false) {
          (0, import_logger.logDebugMessage)(
            "getSession: returning undefined because accessToken is undefined and sessionRequired is false"
          );
          return void 0;
        }
        (0, import_logger.logDebugMessage)("getSession: UNAUTHORISED because accessToken in request is undefined");
        throw new import_error.default({
          message: "Session does not exist. Are you sending the session tokens in the request with the appropriate token transfer method?",
          type: import_error.default.UNAUTHORISED,
          payload: {
            // we do not clear the session here because of a
            // race condition mentioned here: https://github.com/supertokens/supertokens-node/issues/17
            clearTokens: false
          }
        });
      }
      let accessToken;
      try {
        accessToken = (0, import_jwt.parseJWTWithoutSignatureVerification)(accessTokenString);
        (0, import_accessToken.validateAccessTokenStructure)(accessToken.payload, accessToken.version);
      } catch (error) {
        if ((options == null ? void 0 : options.sessionRequired) === false) {
          (0, import_logger.logDebugMessage)(
            "getSession: Returning undefined because parsing failed and sessionRequired is false"
          );
          return void 0;
        }
        (0, import_logger.logDebugMessage)(
          "getSession: UNAUTHORISED because the accessToken couldn't be parsed or had an invalid structure"
        );
        throw new import_error.default({
          message: "Token parsing failed",
          type: "UNAUTHORISED",
          payload: { clearTokens: false }
        });
      }
      const response = await SessionFunctions.getSession(
        helpers,
        accessToken,
        antiCsrfToken,
        (options == null ? void 0 : options.antiCsrfCheck) !== false,
        (options == null ? void 0 : options.checkDatabase) === true,
        config,
        userContext
      );
      (0, import_logger.logDebugMessage)("getSession: Success!");
      const payload = accessToken.version >= 3 ? response.accessToken !== void 0 ? (0, import_jwt.parseJWTWithoutSignatureVerification)(response.accessToken.token).payload : accessToken.payload : response.session.userDataInJWT;
      const session = new import_sessionClass.default(
        helpers,
        response.accessToken !== void 0 ? response.accessToken.token : accessTokenString,
        (0, import_cookieAndHeaders.buildFrontToken)(
          response.session.userId,
          response.accessToken !== void 0 ? response.accessToken.expiry : response.session.expiryTime,
          payload
        ),
        void 0,
        // refresh
        antiCsrfToken,
        response.session.handle,
        response.session.userId,
        response.session.recipeUserId,
        payload,
        void 0,
        response.accessToken !== void 0,
        response.session.tenantId
      );
      return session;
    },
    validateClaims: async function(input) {
      let accessTokenPayload = input.accessTokenPayload;
      let accessTokenPayloadUpdate = void 0;
      const origSessionClaimPayloadJSON = JSON.stringify(accessTokenPayload);
      for (const validator of input.claimValidators) {
        (0, import_logger.logDebugMessage)("updateClaimsInPayloadIfNeeded checking shouldRefetch for " + validator.id);
        if ("claim" in validator && await validator.shouldRefetch(accessTokenPayload, input.userContext)) {
          (0, import_logger.logDebugMessage)("updateClaimsInPayloadIfNeeded refetching " + validator.id);
          const value = await validator.claim.fetchValue(
            input.userId,
            input.recipeUserId,
            accessTokenPayload.tId === void 0 ? import_constants.DEFAULT_TENANT_ID : accessTokenPayload.tId,
            accessTokenPayload,
            input.userContext
          );
          (0, import_logger.logDebugMessage)(
            "updateClaimsInPayloadIfNeeded " + validator.id + " refetch result " + JSON.stringify(value)
          );
          if (value !== void 0) {
            accessTokenPayload = validator.claim.addToPayload_internal(
              accessTokenPayload,
              value,
              input.userContext
            );
          }
        }
      }
      if (JSON.stringify(accessTokenPayload) !== origSessionClaimPayloadJSON) {
        accessTokenPayloadUpdate = accessTokenPayload;
      }
      const invalidClaims = await (0, import_utils.validateClaimsInPayload)(
        input.claimValidators,
        accessTokenPayload,
        input.userContext
      );
      return {
        invalidClaims,
        accessTokenPayloadUpdate
      };
    },
    getSessionInformation: async function({
      sessionHandle,
      userContext
    }) {
      return SessionFunctions.getSessionInformation(helpers, sessionHandle, userContext);
    },
    refreshSession: async function({
      refreshToken,
      antiCsrfToken,
      disableAntiCsrf,
      userContext
    }) {
      if (disableAntiCsrf !== true && typeof config.antiCsrfFunctionOrString === "string" && config.antiCsrfFunctionOrString === "VIA_CUSTOM_HEADER") {
        throw new Error(
          "Since the anti-csrf mode is VIA_CUSTOM_HEADER getSession can't check the CSRF token. Please either use VIA_TOKEN or set antiCsrfCheck to false"
        );
      }
      (0, import_logger.logDebugMessage)("refreshSession: Started");
      const response = await SessionFunctions.refreshSession(
        helpers,
        refreshToken,
        antiCsrfToken,
        disableAntiCsrf,
        config.useDynamicAccessTokenSigningKey,
        userContext
      );
      (0, import_logger.logDebugMessage)("refreshSession: Success!");
      const payload = (0, import_jwt.parseJWTWithoutSignatureVerification)(response.accessToken.token).payload;
      return new import_sessionClass.default(
        helpers,
        response.accessToken.token,
        (0, import_cookieAndHeaders.buildFrontToken)(response.session.userId, response.accessToken.expiry, payload),
        response.refreshToken,
        response.antiCsrfToken,
        response.session.handle,
        response.session.userId,
        response.session.recipeUserId,
        payload,
        void 0,
        true,
        payload.tId
      );
    },
    regenerateAccessToken: async function(input) {
      let newAccessTokenPayload = input.newAccessTokenPayload === null || input.newAccessTokenPayload === void 0 ? {} : input.newAccessTokenPayload;
      let response = await querier.sendPostRequest(
        new import_normalisedURLPath.default("/recipe/session/regenerate"),
        {
          accessToken: input.accessToken,
          userDataInJWT: newAccessTokenPayload
        },
        input.userContext
      );
      if (response.status === "UNAUTHORISED") {
        return void 0;
      }
      return {
        status: response.status,
        session: {
          handle: response.session.handle,
          userId: response.session.userId,
          recipeUserId: new import_recipeUserId.default(response.session.recipeUserId),
          userDataInJWT: response.session.userDataInJWT,
          tenantId: response.session.tenantId
        },
        accessToken: response.accessToken
      };
    },
    revokeAllSessionsForUser: function({
      userId,
      tenantId,
      revokeAcrossAllTenants,
      revokeSessionsForLinkedAccounts,
      userContext
    }) {
      return SessionFunctions.revokeAllSessionsForUser(
        helpers,
        userId,
        revokeSessionsForLinkedAccounts,
        tenantId,
        revokeAcrossAllTenants,
        userContext
      );
    },
    getAllSessionHandlesForUser: function({
      userId,
      fetchSessionsForAllLinkedAccounts,
      tenantId,
      fetchAcrossAllTenants,
      userContext
    }) {
      return SessionFunctions.getAllSessionHandlesForUser(
        helpers,
        userId,
        fetchSessionsForAllLinkedAccounts,
        tenantId,
        fetchAcrossAllTenants,
        userContext
      );
    },
    revokeSession: function({
      sessionHandle,
      userContext
    }) {
      return SessionFunctions.revokeSession(helpers, sessionHandle, userContext);
    },
    revokeMultipleSessions: function({
      sessionHandles,
      userContext
    }) {
      return SessionFunctions.revokeMultipleSessions(helpers, sessionHandles, userContext);
    },
    updateSessionDataInDatabase: function({
      sessionHandle,
      newSessionData,
      userContext
    }) {
      return SessionFunctions.updateSessionDataInDatabase(helpers, sessionHandle, newSessionData, userContext);
    },
    mergeIntoAccessTokenPayload: async function({
      sessionHandle,
      accessTokenPayloadUpdate,
      userContext
    }) {
      const sessionInfo = await this.getSessionInformation({ sessionHandle, userContext });
      if (sessionInfo === void 0) {
        return false;
      }
      let newAccessTokenPayload = __spreadValues({}, sessionInfo.customClaimsInAccessTokenPayload);
      for (const key of import_constants2.protectedProps) {
        delete newAccessTokenPayload[key];
      }
      newAccessTokenPayload = __spreadValues(__spreadValues({}, newAccessTokenPayload), accessTokenPayloadUpdate);
      for (const key of Object.keys(accessTokenPayloadUpdate)) {
        if (accessTokenPayloadUpdate[key] === null) {
          delete newAccessTokenPayload[key];
        }
      }
      return SessionFunctions.updateAccessTokenPayload(
        helpers,
        sessionHandle,
        newAccessTokenPayload,
        userContext
      );
    },
    fetchAndSetClaim: async function(input) {
      const sessionInfo = await this.getSessionInformation({
        sessionHandle: input.sessionHandle,
        userContext: input.userContext
      });
      if (sessionInfo === void 0) {
        return false;
      }
      const accessTokenPayloadUpdate = await input.claim.build(
        sessionInfo.userId,
        sessionInfo.recipeUserId,
        sessionInfo.tenantId,
        sessionInfo.customClaimsInAccessTokenPayload,
        input.userContext
      );
      return this.mergeIntoAccessTokenPayload({
        sessionHandle: input.sessionHandle,
        accessTokenPayloadUpdate,
        userContext: input.userContext
      });
    },
    setClaimValue: function(input) {
      const accessTokenPayloadUpdate = input.claim.addToPayload_internal({}, input.value, input.userContext);
      return this.mergeIntoAccessTokenPayload({
        sessionHandle: input.sessionHandle,
        accessTokenPayloadUpdate,
        userContext: input.userContext
      });
    },
    getClaimValue: async function(input) {
      const sessionInfo = await this.getSessionInformation({
        sessionHandle: input.sessionHandle,
        userContext: input.userContext
      });
      if (sessionInfo === void 0) {
        return {
          status: "SESSION_DOES_NOT_EXIST_ERROR"
        };
      }
      return {
        status: "OK",
        value: input.claim.getValueFromPayload(sessionInfo.customClaimsInAccessTokenPayload, input.userContext)
      };
    },
    removeClaim: function(input) {
      const accessTokenPayloadUpdate = input.claim.removeFromPayloadByMerge_internal({}, input.userContext);
      return this.mergeIntoAccessTokenPayload({
        sessionHandle: input.sessionHandle,
        accessTokenPayloadUpdate,
        userContext: input.userContext
      });
    }
  };
  let helpers = {
    querier,
    JWKS: combinedJWKS,
    config,
    appInfo,
    getRecipeImpl: getRecipeImplAfterOverrides
  };
  if (import_node_process.env.TEST_MODE === "testing") {
    obj.helpers = helpers;
  }
  return obj;
}
