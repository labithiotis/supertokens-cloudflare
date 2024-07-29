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
import { createRemoteJWKSet } from "jose";
import * as SessionFunctions from "./sessionFunctions";
import { buildFrontToken } from "./cookieAndHeaders";
import { validateClaimsInPayload } from "./utils";
import Session from "./sessionClass";
import NormalisedURLPath from "../../normalisedURLPath";
import { logDebugMessage } from "../../logger";
import { parseJWTWithoutSignatureVerification } from "./jwt";
import { validateAccessTokenStructure } from "./accessToken";
import SessionError from "./error";
import RecipeUserId from "../../recipeUserId";
import { DEFAULT_TENANT_ID } from "../multitenancy/constants";
import { JWKCacheCooldownInMs, protectedProps } from "./constants";
import { env } from "node:process";
function getRecipeInterface(querier, config, appInfo, getRecipeImplAfterOverrides) {
  const JWKS = querier.getAllCoreUrlsForPath("/.well-known/jwks.json").map(
    (url) => createRemoteJWKSet(new URL(url), {
      cooldownDuration: JWKCacheCooldownInMs,
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
      logDebugMessage("createNewSession: Started");
      let response = await SessionFunctions.createNewSession(
        helpers,
        tenantId,
        recipeUserId,
        disableAntiCsrf === true,
        accessTokenPayload,
        sessionDataInDatabase,
        userContext
      );
      logDebugMessage("createNewSession: Finished");
      const payload = parseJWTWithoutSignatureVerification(response.accessToken.token).payload;
      return new Session(
        helpers,
        response.accessToken.token,
        buildFrontToken(response.session.userId, response.accessToken.expiry, payload),
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
      logDebugMessage("getSession: Started");
      if (accessTokenString === void 0) {
        if ((options == null ? void 0 : options.sessionRequired) === false) {
          logDebugMessage(
            "getSession: returning undefined because accessToken is undefined and sessionRequired is false"
          );
          return void 0;
        }
        logDebugMessage("getSession: UNAUTHORISED because accessToken in request is undefined");
        throw new SessionError({
          message: "Session does not exist. Are you sending the session tokens in the request with the appropriate token transfer method?",
          type: SessionError.UNAUTHORISED,
          payload: {
            // we do not clear the session here because of a
            // race condition mentioned here: https://github.com/supertokens/supertokens-node/issues/17
            clearTokens: false
          }
        });
      }
      let accessToken;
      try {
        accessToken = parseJWTWithoutSignatureVerification(accessTokenString);
        validateAccessTokenStructure(accessToken.payload, accessToken.version);
      } catch (error) {
        if ((options == null ? void 0 : options.sessionRequired) === false) {
          logDebugMessage(
            "getSession: Returning undefined because parsing failed and sessionRequired is false"
          );
          return void 0;
        }
        logDebugMessage(
          "getSession: UNAUTHORISED because the accessToken couldn't be parsed or had an invalid structure"
        );
        throw new SessionError({
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
      logDebugMessage("getSession: Success!");
      const payload = accessToken.version >= 3 ? response.accessToken !== void 0 ? parseJWTWithoutSignatureVerification(response.accessToken.token).payload : accessToken.payload : response.session.userDataInJWT;
      const session = new Session(
        helpers,
        response.accessToken !== void 0 ? response.accessToken.token : accessTokenString,
        buildFrontToken(
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
        logDebugMessage("updateClaimsInPayloadIfNeeded checking shouldRefetch for " + validator.id);
        if ("claim" in validator && await validator.shouldRefetch(accessTokenPayload, input.userContext)) {
          logDebugMessage("updateClaimsInPayloadIfNeeded refetching " + validator.id);
          const value = await validator.claim.fetchValue(
            input.userId,
            input.recipeUserId,
            accessTokenPayload.tId === void 0 ? DEFAULT_TENANT_ID : accessTokenPayload.tId,
            accessTokenPayload,
            input.userContext
          );
          logDebugMessage(
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
      const invalidClaims = await validateClaimsInPayload(
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
      logDebugMessage("refreshSession: Started");
      const response = await SessionFunctions.refreshSession(
        helpers,
        refreshToken,
        antiCsrfToken,
        disableAntiCsrf,
        config.useDynamicAccessTokenSigningKey,
        userContext
      );
      logDebugMessage("refreshSession: Success!");
      const payload = parseJWTWithoutSignatureVerification(response.accessToken.token).payload;
      return new Session(
        helpers,
        response.accessToken.token,
        buildFrontToken(response.session.userId, response.accessToken.expiry, payload),
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
        new NormalisedURLPath("/recipe/session/regenerate"),
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
          recipeUserId: new RecipeUserId(response.session.recipeUserId),
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
      for (const key of protectedProps) {
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
  if (env.TEST_MODE === "testing") {
    obj.helpers = helpers;
  }
  return obj;
}
export {
  getRecipeInterface as default
};
