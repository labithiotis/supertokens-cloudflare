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
var sessionFunctions_exports = {};
__export(sessionFunctions_exports, {
  createNewSession: () => createNewSession,
  getAllSessionHandlesForUser: () => getAllSessionHandlesForUser,
  getSession: () => getSession,
  getSessionInformation: () => getSessionInformation,
  refreshSession: () => refreshSession,
  revokeAllSessionsForUser: () => revokeAllSessionsForUser,
  revokeMultipleSessions: () => revokeMultipleSessions,
  revokeSession: () => revokeSession,
  updateAccessTokenPayload: () => updateAccessTokenPayload,
  updateSessionDataInDatabase: () => updateSessionDataInDatabase
});
module.exports = __toCommonJS(sessionFunctions_exports);
var import_accessToken = require("./accessToken");
var import_error = __toESM(require("./error"), 1);
var import_processState = require("../../processState");
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import_utils = require("../../utils");
var import_logger = require("../../logger");
var import_recipeUserId = __toESM(require("../../recipeUserId"), 1);
var import_constants = require("../multitenancy/constants");
var import_error2 = __toESM(require("../../error"), 1);
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
    new import_normalisedURLPath.default(`/${tenantId}/recipe/session`),
    requestBody,
    userContext
  );
  return {
    session: {
      handle: response.session.handle,
      userId: response.session.userId,
      recipeUserId: new import_recipeUserId.default(response.session.recipeUserId),
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
    accessTokenInfo = await (0, import_accessToken.getInfoFromAccessToken)(
      parsedAccessToken,
      helpers.JWKS,
      helpers.config.antiCsrfFunctionOrString === "VIA_TOKEN" && doAntiCsrfCheck
    );
  } catch (err) {
    if (err instanceof import_error2.default && err.type !== import_error.default.TRY_REFRESH_TOKEN) {
      throw err;
    }
    if (parsedAccessToken.version < 3) {
      let payload = parsedAccessToken.payload;
      const timeCreated = (0, import_accessToken.sanitizeNumberInput)(payload.timeCreated);
      const expiryTime = (0, import_accessToken.sanitizeNumberInput)(payload.expiryTime);
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
      (0, import_logger.logDebugMessage)(
        "getSession: Returning TRY_REFRESH_TOKEN because the access token doesn't match the useDynamicAccessTokenSigningKey in the config"
      );
      throw new import_error.default({
        message: "The access token doesn't match the useDynamicAccessTokenSigningKey setting",
        type: import_error.default.TRY_REFRESH_TOKEN
      });
    }
  }
  if (doAntiCsrfCheck) {
    if (helpers.config.antiCsrfFunctionOrString === "VIA_TOKEN") {
      if (accessTokenInfo !== void 0) {
        if (antiCsrfToken === void 0 || antiCsrfToken !== accessTokenInfo.antiCsrfToken) {
          if (antiCsrfToken === void 0) {
            (0, import_logger.logDebugMessage)(
              "getSession: Returning TRY_REFRESH_TOKEN because antiCsrfToken is missing from request"
            );
            throw new import_error.default({
              message: "Provided antiCsrfToken is undefined. If you do not want anti-csrf check for this API, please set doAntiCsrfCheck to false for this API",
              type: import_error.default.TRY_REFRESH_TOKEN
            });
          } else {
            (0, import_logger.logDebugMessage)(
              "getSession: Returning TRY_REFRESH_TOKEN because the passed antiCsrfToken is not the same as in the access token"
            );
            throw new import_error.default({
              message: "anti-csrf check failed",
              type: import_error.default.TRY_REFRESH_TOKEN
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
  import_processState.ProcessState.getInstance().addState(import_processState.PROCESS_STATE.CALLING_SERVICE_IN_VERIFY);
  let requestBody = {
    accessToken: parsedAccessToken.rawTokenString,
    antiCsrfToken,
    doAntiCsrfCheck,
    enableAntiCsrf: helpers.config.antiCsrfFunctionOrString === "VIA_TOKEN",
    checkDatabase: alwaysCheckCore
  };
  let response = await helpers.querier.sendPostRequest(
    new import_normalisedURLPath.default("/recipe/session/verify"),
    requestBody,
    userContext
  );
  if (response.status === "OK") {
    delete response.status;
    return __spreadProps(__spreadValues({}, response), {
      session: {
        handle: response.session.handle,
        userId: response.session.userId,
        recipeUserId: new import_recipeUserId.default(response.session.recipeUserId),
        expiryTime: ((_a = response.accessToken) == null ? void 0 : _a.expiry) || // if we got a new accesstoken we take the expiry time from there
        (accessTokenInfo == null ? void 0 : accessTokenInfo.expiryTime) || // if we didn't get a new access token but could validate the token take that info (alwaysCheckCore === true, or parentRefreshTokenHash1 !== null)
        parsedAccessToken.payload["expiryTime"],
        // if the token didn't pass validation, but we got here, it means it was a v2 token that we didn't have the key cached for.
        tenantId: ((_b = response.session) == null ? void 0 : _b.tenantId) || (accessTokenInfo == null ? void 0 : accessTokenInfo.tenantId) || import_constants.DEFAULT_TENANT_ID,
        userDataInJWT: response.session.userDataInJWT
      }
    });
  } else if (response.status === "UNAUTHORISED") {
    (0, import_logger.logDebugMessage)("getSession: Returning UNAUTHORISED because of core response");
    throw new import_error.default({
      message: response.message,
      type: import_error.default.UNAUTHORISED
    });
  } else {
    (0, import_logger.logDebugMessage)("getSession: Returning TRY_REFRESH_TOKEN because of core response.");
    throw new import_error.default({
      message: response.message,
      type: import_error.default.TRY_REFRESH_TOKEN
    });
  }
}
async function getSessionInformation(helpers, sessionHandle, userContext) {
  let apiVersion = await helpers.querier.getAPIVersion(userContext);
  if ((0, import_utils.maxVersion)(apiVersion, "2.7") === "2.7") {
    throw new Error("Please use core version >= 3.5 to call this function.");
  }
  let response = await helpers.querier.sendGetRequest(
    new import_normalisedURLPath.default(`/recipe/session`),
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
      recipeUserId: new import_recipeUserId.default(response.recipeUserId),
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
    new import_normalisedURLPath.default("/recipe/session/refresh"),
    requestBody,
    userContext
  );
  if (response.status === "OK") {
    return {
      session: {
        handle: response.session.handle,
        userId: response.session.userId,
        recipeUserId: new import_recipeUserId.default(response.session.recipeUserId),
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
    (0, import_logger.logDebugMessage)("refreshSession: Returning UNAUTHORISED because of core response");
    throw new import_error.default({
      message: response.message,
      type: import_error.default.UNAUTHORISED
    });
  } else {
    (0, import_logger.logDebugMessage)("refreshSession: Returning TOKEN_THEFT_DETECTED because of core response");
    throw new import_error.default({
      message: "Token theft detected",
      payload: {
        recipeUserId: new import_recipeUserId.default(response.session.recipeUserId),
        userId: response.session.userId,
        sessionHandle: response.session.handle
      },
      type: import_error.default.TOKEN_THEFT_DETECTED
    });
  }
}
async function revokeAllSessionsForUser(helpers, userId, revokeSessionsForLinkedAccounts, tenantId, revokeAcrossAllTenants, userContext) {
  if (tenantId === void 0) {
    tenantId = import_constants.DEFAULT_TENANT_ID;
  }
  let response = await helpers.querier.sendPostRequest(
    new import_normalisedURLPath.default(revokeAcrossAllTenants ? `/recipe/session/remove` : `/${tenantId}/recipe/session/remove`),
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
    tenantId = import_constants.DEFAULT_TENANT_ID;
  }
  let response = await helpers.querier.sendGetRequest(
    new import_normalisedURLPath.default(fetchAcrossAllTenants ? `/recipe/session/user` : `/${tenantId}/recipe/session/user`),
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
    new import_normalisedURLPath.default("/recipe/session/remove"),
    {
      sessionHandles: [sessionHandle]
    },
    userContext
  );
  return response.sessionHandlesRevoked.length === 1;
}
async function revokeMultipleSessions(helpers, sessionHandles, userContext) {
  let response = await helpers.querier.sendPostRequest(
    new import_normalisedURLPath.default(`/recipe/session/remove`),
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
    new import_normalisedURLPath.default(`/recipe/session/data`),
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
    new import_normalisedURLPath.default("/recipe/jwt/data"),
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
