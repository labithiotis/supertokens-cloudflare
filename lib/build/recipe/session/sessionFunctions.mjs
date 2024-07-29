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
import { getInfoFromAccessToken, sanitizeNumberInput } from "./accessToken";
import STError from "./error";
import { PROCESS_STATE, ProcessState } from "../../processState";
import NormalisedURLPath from "../../normalisedURLPath";
import { maxVersion } from "../../utils";
import { logDebugMessage } from "../../logger";
import RecipeUserId from "../../recipeUserId";
import { DEFAULT_TENANT_ID } from "../multitenancy/constants";
import SuperTokensError from "../../error";
async function createNewSession(helpers, tenantId, recipeUserId, disableAntiCsrf, accessTokenPayload, sessionDataInDatabase, userContext) {
  accessTokenPayload = accessTokenPayload === null || accessTokenPayload === void 0 ? {} : accessTokenPayload;
  sessionDataInDatabase = sessionDataInDatabase === null || sessionDataInDatabase === void 0 ? {} : sessionDataInDatabase;
  const requestBody = {
    userId: recipeUserId.getAsString(),
    userDataInJWT: __spreadValues({}, accessTokenPayload),
    userDataInDatabase: sessionDataInDatabase,
    useDynamicSigningKey: helpers.config.useDynamicAccessTokenSigningKey,
    // We dont need to check if anti csrf is a function here because checking for "VIA_TOKEN" is enough
    enableAntiCsrf: !disableAntiCsrf && helpers.config.antiCsrfFunctionOrString === "VIA_TOKEN"
  };
  let response = await helpers.querier.sendPostRequest(
    new NormalisedURLPath(`/${tenantId}/recipe/session`),
    requestBody,
    userContext
  );
  return {
    session: {
      handle: response.session.handle,
      userId: response.session.userId,
      recipeUserId: new RecipeUserId(response.session.recipeUserId),
      userDataInJWT: response.session.userDataInJWT,
      tenantId: response.session.tenantId
    },
    accessToken: {
      token: response.accessToken.token,
      createdTime: response.accessToken.createdTime,
      expiry: response.accessToken.expiry
    },
    refreshToken: {
      token: response.refreshToken.token,
      createdTime: response.refreshToken.createdTime,
      expiry: response.refreshToken.expiry
    },
    antiCsrfToken: response.antiCsrfToken
  };
}
async function getSession(helpers, parsedAccessToken, antiCsrfToken, doAntiCsrfCheck, alwaysCheckCore, config, userContext) {
  var _a, _b;
  let accessTokenInfo;
  try {
    accessTokenInfo = await getInfoFromAccessToken(
      parsedAccessToken,
      helpers.JWKS,
      helpers.config.antiCsrfFunctionOrString === "VIA_TOKEN" && doAntiCsrfCheck
    );
  } catch (err) {
    if (err instanceof SuperTokensError && err.type !== STError.TRY_REFRESH_TOKEN) {
      throw err;
    }
    if (parsedAccessToken.version < 3) {
      let payload = parsedAccessToken.payload;
      const timeCreated = sanitizeNumberInput(payload.timeCreated);
      const expiryTime = sanitizeNumberInput(payload.expiryTime);
      if (expiryTime === void 0 || timeCreated == void 0) {
        throw err;
      }
      if (expiryTime < Date.now()) {
        throw err;
      }
      if (timeCreated <= Date.now() - config.jwksRefreshIntervalSec * 1e3) {
        throw err;
      }
    } else {
      throw err;
    }
  }
  if (parsedAccessToken.version >= 3) {
    const tokenUsesDynamicKey = parsedAccessToken.kid.startsWith("d-");
    if (tokenUsesDynamicKey !== helpers.config.useDynamicAccessTokenSigningKey) {
      logDebugMessage(
        "getSession: Returning TRY_REFRESH_TOKEN because the access token doesn't match the useDynamicAccessTokenSigningKey in the config"
      );
      throw new STError({
        message: "The access token doesn't match the useDynamicAccessTokenSigningKey setting",
        type: STError.TRY_REFRESH_TOKEN
      });
    }
  }
  if (doAntiCsrfCheck) {
    if (helpers.config.antiCsrfFunctionOrString === "VIA_TOKEN") {
      if (accessTokenInfo !== void 0) {
        if (antiCsrfToken === void 0 || antiCsrfToken !== accessTokenInfo.antiCsrfToken) {
          if (antiCsrfToken === void 0) {
            logDebugMessage(
              "getSession: Returning TRY_REFRESH_TOKEN because antiCsrfToken is missing from request"
            );
            throw new STError({
              message: "Provided antiCsrfToken is undefined. If you do not want anti-csrf check for this API, please set doAntiCsrfCheck to false for this API",
              type: STError.TRY_REFRESH_TOKEN
            });
          } else {
            logDebugMessage(
              "getSession: Returning TRY_REFRESH_TOKEN because the passed antiCsrfToken is not the same as in the access token"
            );
            throw new STError({
              message: "anti-csrf check failed",
              type: STError.TRY_REFRESH_TOKEN
            });
          }
        }
      }
    } else if (typeof helpers.config.antiCsrfFunctionOrString === "string" && helpers.config.antiCsrfFunctionOrString === "VIA_CUSTOM_HEADER") {
      throw new Error("Please either use VIA_TOKEN, NONE or call with doAntiCsrfCheck false");
    }
  }
  if (accessTokenInfo !== void 0 && !alwaysCheckCore && accessTokenInfo.parentRefreshTokenHash1 === void 0) {
    return {
      session: {
        handle: accessTokenInfo.sessionHandle,
        userId: accessTokenInfo.userId,
        recipeUserId: accessTokenInfo.recipeUserId,
        userDataInJWT: accessTokenInfo.userData,
        expiryTime: accessTokenInfo.expiryTime,
        tenantId: accessTokenInfo.tenantId
      }
    };
  }
  ProcessState.getInstance().addState(PROCESS_STATE.CALLING_SERVICE_IN_VERIFY);
  let requestBody = {
    accessToken: parsedAccessToken.rawTokenString,
    antiCsrfToken,
    doAntiCsrfCheck,
    enableAntiCsrf: helpers.config.antiCsrfFunctionOrString === "VIA_TOKEN",
    checkDatabase: alwaysCheckCore
  };
  let response = await helpers.querier.sendPostRequest(
    new NormalisedURLPath("/recipe/session/verify"),
    requestBody,
    userContext
  );
  if (response.status === "OK") {
    delete response.status;
    return __spreadProps(__spreadValues({}, response), {
      session: {
        handle: response.session.handle,
        userId: response.session.userId,
        recipeUserId: new RecipeUserId(response.session.recipeUserId),
        expiryTime: ((_a = response.accessToken) == null ? void 0 : _a.expiry) || // if we got a new accesstoken we take the expiry time from there
        (accessTokenInfo == null ? void 0 : accessTokenInfo.expiryTime) || // if we didn't get a new access token but could validate the token take that info (alwaysCheckCore === true, or parentRefreshTokenHash1 !== null)
        parsedAccessToken.payload["expiryTime"],
        // if the token didn't pass validation, but we got here, it means it was a v2 token that we didn't have the key cached for.
        tenantId: ((_b = response.session) == null ? void 0 : _b.tenantId) || (accessTokenInfo == null ? void 0 : accessTokenInfo.tenantId) || DEFAULT_TENANT_ID,
        userDataInJWT: response.session.userDataInJWT
      }
    });
  } else if (response.status === "UNAUTHORISED") {
    logDebugMessage("getSession: Returning UNAUTHORISED because of core response");
    throw new STError({
      message: response.message,
      type: STError.UNAUTHORISED
    });
  } else {
    logDebugMessage("getSession: Returning TRY_REFRESH_TOKEN because of core response.");
    throw new STError({
      message: response.message,
      type: STError.TRY_REFRESH_TOKEN
    });
  }
}
async function getSessionInformation(helpers, sessionHandle, userContext) {
  let apiVersion = await helpers.querier.getAPIVersion(userContext);
  if (maxVersion(apiVersion, "2.7") === "2.7") {
    throw new Error("Please use core version >= 3.5 to call this function.");
  }
  let response = await helpers.querier.sendGetRequest(
    new NormalisedURLPath(`/recipe/session`),
    {
      sessionHandle
    },
    userContext
  );
  if (response.status === "OK") {
    return {
      sessionHandle: response.sessionHandle,
      timeCreated: response.timeCreated,
      expiry: response.expiry,
      userId: response.userId,
      recipeUserId: new RecipeUserId(response.recipeUserId),
      sessionDataInDatabase: response.userDataInDatabase,
      customClaimsInAccessTokenPayload: response.userDataInJWT,
      tenantId: response.tenantId
    };
  } else {
    return void 0;
  }
}
async function refreshSession(helpers, refreshToken, antiCsrfToken, disableAntiCsrf, useDynamicAccessTokenSigningKey, userContext) {
  let requestBody = {
    refreshToken,
    antiCsrfToken,
    enableAntiCsrf: !disableAntiCsrf && helpers.config.antiCsrfFunctionOrString === "VIA_TOKEN",
    useDynamicSigningKey: useDynamicAccessTokenSigningKey
  };
  if (typeof helpers.config.antiCsrfFunctionOrString === "string" && helpers.config.antiCsrfFunctionOrString === "VIA_CUSTOM_HEADER" && !disableAntiCsrf) {
    throw new Error("Please either use VIA_TOKEN, NONE or call with doAntiCsrfCheck false");
  }
  let response = await helpers.querier.sendPostRequest(
    new NormalisedURLPath("/recipe/session/refresh"),
    requestBody,
    userContext
  );
  if (response.status === "OK") {
    return {
      session: {
        handle: response.session.handle,
        userId: response.session.userId,
        recipeUserId: new RecipeUserId(response.session.recipeUserId),
        userDataInJWT: response.session.userDataInJWT,
        tenantId: response.session.tenantId
      },
      accessToken: {
        token: response.accessToken.token,
        createdTime: response.accessToken.createdTime,
        expiry: response.accessToken.expiry
      },
      refreshToken: {
        token: response.refreshToken.token,
        createdTime: response.refreshToken.createdTime,
        expiry: response.refreshToken.expiry
      },
      antiCsrfToken: response.antiCsrfToken
    };
  } else if (response.status === "UNAUTHORISED") {
    logDebugMessage("refreshSession: Returning UNAUTHORISED because of core response");
    throw new STError({
      message: response.message,
      type: STError.UNAUTHORISED
    });
  } else {
    logDebugMessage("refreshSession: Returning TOKEN_THEFT_DETECTED because of core response");
    throw new STError({
      message: "Token theft detected",
      payload: {
        recipeUserId: new RecipeUserId(response.session.recipeUserId),
        userId: response.session.userId,
        sessionHandle: response.session.handle
      },
      type: STError.TOKEN_THEFT_DETECTED
    });
  }
}
async function revokeAllSessionsForUser(helpers, userId, revokeSessionsForLinkedAccounts, tenantId, revokeAcrossAllTenants, userContext) {
  if (tenantId === void 0) {
    tenantId = DEFAULT_TENANT_ID;
  }
  let response = await helpers.querier.sendPostRequest(
    new NormalisedURLPath(revokeAcrossAllTenants ? `/recipe/session/remove` : `/${tenantId}/recipe/session/remove`),
    {
      userId,
      revokeSessionsForLinkedAccounts,
      revokeAcrossAllTenants
    },
    userContext
  );
  return response.sessionHandlesRevoked;
}
async function getAllSessionHandlesForUser(helpers, userId, fetchSessionsForAllLinkedAccounts, tenantId, fetchAcrossAllTenants, userContext) {
  if (tenantId === void 0) {
    tenantId = DEFAULT_TENANT_ID;
  }
  let response = await helpers.querier.sendGetRequest(
    new NormalisedURLPath(fetchAcrossAllTenants ? `/recipe/session/user` : `/${tenantId}/recipe/session/user`),
    {
      userId,
      fetchSessionsForAllLinkedAccounts,
      fetchAcrossAllTenants
    },
    userContext
  );
  return response.sessionHandles;
}
async function revokeSession(helpers, sessionHandle, userContext) {
  let response = await helpers.querier.sendPostRequest(
    new NormalisedURLPath("/recipe/session/remove"),
    {
      sessionHandles: [sessionHandle]
    },
    userContext
  );
  return response.sessionHandlesRevoked.length === 1;
}
async function revokeMultipleSessions(helpers, sessionHandles, userContext) {
  let response = await helpers.querier.sendPostRequest(
    new NormalisedURLPath(`/recipe/session/remove`),
    {
      sessionHandles
    },
    userContext
  );
  return response.sessionHandlesRevoked;
}
async function updateSessionDataInDatabase(helpers, sessionHandle, newSessionData, userContext) {
  newSessionData = newSessionData === null || newSessionData === void 0 ? {} : newSessionData;
  let response = await helpers.querier.sendPutRequest(
    new NormalisedURLPath(`/recipe/session/data`),
    {
      sessionHandle,
      userDataInDatabase: newSessionData
    },
    userContext
  );
  if (response.status === "UNAUTHORISED") {
    return false;
  }
  return true;
}
async function updateAccessTokenPayload(helpers, sessionHandle, newAccessTokenPayload, userContext) {
  newAccessTokenPayload = newAccessTokenPayload === null || newAccessTokenPayload === void 0 ? {} : newAccessTokenPayload;
  let response = await helpers.querier.sendPutRequest(
    new NormalisedURLPath("/recipe/jwt/data"),
    {
      sessionHandle,
      userDataInJWT: newAccessTokenPayload
    },
    userContext
  );
  if (response.status === "UNAUTHORISED") {
    return false;
  }
  return true;
}
export {
  createNewSession,
  getAllSessionHandlesForUser,
  getSession,
  getSessionInformation,
  refreshSession,
  revokeAllSessionsForUser,
  revokeMultipleSessions,
  revokeSession,
  updateAccessTokenPayload,
  updateSessionDataInDatabase
};
