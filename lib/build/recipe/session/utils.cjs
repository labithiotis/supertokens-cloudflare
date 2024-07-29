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
var utils_exports = {};
__export(utils_exports, {
  getRequiredClaimValidators: () => getRequiredClaimValidators,
  getURLProtocol: () => getURLProtocol,
  normaliseSameSiteOrThrowError: () => normaliseSameSiteOrThrowError,
  normaliseSessionScopeOrThrowError: () => normaliseSessionScopeOrThrowError,
  sendInvalidClaimResponse: () => sendInvalidClaimResponse,
  sendTokenTheftDetectedResponse: () => sendTokenTheftDetectedResponse,
  sendTryRefreshTokenResponse: () => sendTryRefreshTokenResponse,
  sendUnauthorisedResponse: () => sendUnauthorisedResponse,
  setAccessTokenInResponse: () => setAccessTokenInResponse,
  validateAndNormaliseUserInput: () => validateAndNormaliseUserInput,
  validateClaimsInPayload: () => validateClaimsInPayload
});
module.exports = __toCommonJS(utils_exports);
var import_cookieAndHeaders = require("./cookieAndHeaders");
var import_recipe = __toESM(require("./recipe"), 1);
var import_constants = require("./constants");
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import_utils = require("../../utils");
var import_utils2 = require("../../utils");
var import_logger = require("../../logger");
async function sendTryRefreshTokenResponse(recipeInstance, _, __, response, ___) {
  (0, import_utils2.sendNon200ResponseWithMessage)(response, "try refresh token", recipeInstance.config.sessionExpiredStatusCode);
}
async function sendUnauthorisedResponse(recipeInstance, _, __, response, ___) {
  (0, import_utils2.sendNon200ResponseWithMessage)(response, "unauthorised", recipeInstance.config.sessionExpiredStatusCode);
}
async function sendInvalidClaimResponse(recipeInstance, claimValidationErrors, __, response, ___) {
  (0, import_utils2.sendNon200Response)(response, recipeInstance.config.invalidClaimStatusCode, {
    message: "invalid claim",
    claimValidationErrors
  });
}
async function sendTokenTheftDetectedResponse(recipeInstance, sessionHandle, _, __, ___, response, userContext) {
  await recipeInstance.recipeInterfaceImpl.revokeSession({ sessionHandle, userContext });
  (0, import_utils2.sendNon200ResponseWithMessage)(response, "token theft detected", recipeInstance.config.sessionExpiredStatusCode);
}
function normaliseSessionScopeOrThrowError(sessionScope) {
  function helper(sessionScope2) {
    sessionScope2 = sessionScope2.trim().toLowerCase();
    if (sessionScope2.startsWith(".")) {
      sessionScope2 = sessionScope2.substr(1);
    }
    if (!sessionScope2.startsWith("http://") && !sessionScope2.startsWith("https://")) {
      sessionScope2 = "http://" + sessionScope2;
    }
    try {
      let urlObj = new URL(sessionScope2);
      sessionScope2 = urlObj.hostname;
      return sessionScope2;
    } catch (err) {
      throw new Error("Please provide a valid sessionScope");
    }
  }
  let noDotNormalised = helper(sessionScope);
  if (noDotNormalised === "localhost" || (0, import_utils.isAnIpAddress)(noDotNormalised)) {
    return noDotNormalised;
  }
  if (sessionScope.startsWith(".")) {
    return "." + noDotNormalised;
  }
  return noDotNormalised;
}
function getURLProtocol(url) {
  let urlObj = new URL(url);
  return urlObj.protocol;
}
function validateAndNormaliseUserInput(recipeInstance, appInfo, config) {
  var _a, _b, _c, _d, _e;
  let cookieDomain = config === void 0 || config.cookieDomain === void 0 ? void 0 : normaliseSessionScopeOrThrowError(config.cookieDomain);
  let olderCookieDomain = config === void 0 || config.olderCookieDomain === void 0 || config.olderCookieDomain === "" ? config == null ? void 0 : config.olderCookieDomain : normaliseSessionScopeOrThrowError(config.olderCookieDomain);
  let accessTokenPath = config === void 0 || config.accessTokenPath === void 0 ? new import_normalisedURLPath.default("/") : new import_normalisedURLPath.default(config.accessTokenPath);
  let protocolOfAPIDomain = getURLProtocol(appInfo.apiDomain.getAsStringDangerous());
  let cookieSameSite = (input) => {
    let protocolOfWebsiteDomain = getURLProtocol(
      appInfo.getOrigin({
        request: input.request,
        userContext: input.userContext
      }).getAsStringDangerous()
    );
    return appInfo.topLevelAPIDomain !== appInfo.getTopLevelWebsiteDomain(input) || protocolOfAPIDomain !== protocolOfWebsiteDomain ? "none" : "lax";
  };
  if (config !== void 0 && config.cookieSameSite !== void 0) {
    let normalisedCookieSameSite = normaliseSameSiteOrThrowError(config.cookieSameSite);
    cookieSameSite = () => normalisedCookieSameSite;
  }
  let cookieSecure = config === void 0 || config.cookieSecure === void 0 ? appInfo.apiDomain.getAsStringDangerous().startsWith("https") : config.cookieSecure;
  let sessionExpiredStatusCode = config === void 0 || config.sessionExpiredStatusCode === void 0 ? 401 : config.sessionExpiredStatusCode;
  const invalidClaimStatusCode = (_a = config == null ? void 0 : config.invalidClaimStatusCode) != null ? _a : 403;
  if (sessionExpiredStatusCode === invalidClaimStatusCode) {
    throw new Error("sessionExpiredStatusCode and sessionExpiredStatusCode must be different");
  }
  if (config !== void 0 && config.antiCsrf !== void 0) {
    if (config.antiCsrf !== "NONE" && config.antiCsrf !== "VIA_CUSTOM_HEADER" && config.antiCsrf !== "VIA_TOKEN") {
      throw new Error("antiCsrf config must be one of 'NONE' or 'VIA_CUSTOM_HEADER' or 'VIA_TOKEN'");
    }
  }
  let antiCsrf = ({
    request,
    userContext
  }) => {
    const sameSite = cookieSameSite({
      request,
      userContext
    });
    if (sameSite === "none") {
      return "VIA_CUSTOM_HEADER";
    }
    return "NONE";
  };
  if (config !== void 0 && config.antiCsrf !== void 0) {
    antiCsrf = config.antiCsrf;
  }
  let errorHandlers = {
    onTokenTheftDetected: async (sessionHandle, userId, recipeUserId, request, response, userContext) => {
      return await sendTokenTheftDetectedResponse(
        recipeInstance,
        sessionHandle,
        userId,
        recipeUserId,
        request,
        response,
        userContext
      );
    },
    onTryRefreshToken: async (message, request, response, userContext) => {
      return await sendTryRefreshTokenResponse(recipeInstance, message, request, response, userContext);
    },
    onUnauthorised: async (message, request, response, userContext) => {
      return await sendUnauthorisedResponse(recipeInstance, message, request, response, userContext);
    },
    onInvalidClaim: (validationErrors, request, response, userContext) => {
      return sendInvalidClaimResponse(recipeInstance, validationErrors, request, response, userContext);
    },
    onClearDuplicateSessionCookies: async (message, _, response, __) => {
      return (0, import_utils.send200Response)(response, { message });
    }
  };
  if (config !== void 0 && config.errorHandlers !== void 0) {
    if (config.errorHandlers.onTokenTheftDetected !== void 0) {
      errorHandlers.onTokenTheftDetected = config.errorHandlers.onTokenTheftDetected;
    }
    if (config.errorHandlers.onUnauthorised !== void 0) {
      errorHandlers.onUnauthorised = config.errorHandlers.onUnauthorised;
    }
    if (config.errorHandlers.onInvalidClaim !== void 0) {
      errorHandlers.onInvalidClaim = config.errorHandlers.onInvalidClaim;
    }
    if (config.errorHandlers.onTryRefreshToken !== void 0) {
      errorHandlers.onTryRefreshToken = config.errorHandlers.onTryRefreshToken;
    }
    if (config.errorHandlers.onClearDuplicateSessionCookies !== void 0) {
      errorHandlers.onClearDuplicateSessionCookies = config.errorHandlers.onClearDuplicateSessionCookies;
    }
  }
  let override = __spreadValues({
    functions: (originalImplementation) => originalImplementation,
    apis: (originalImplementation) => originalImplementation
  }, config == null ? void 0 : config.override);
  return {
    useDynamicAccessTokenSigningKey: (_b = config == null ? void 0 : config.useDynamicAccessTokenSigningKey) != null ? _b : true,
    exposeAccessTokenToFrontendInCookieBasedAuth: (_c = config == null ? void 0 : config.exposeAccessTokenToFrontendInCookieBasedAuth) != null ? _c : false,
    refreshTokenPath: appInfo.apiBasePath.appendPath(new import_normalisedURLPath.default(import_constants.REFRESH_API_PATH)),
    accessTokenPath,
    getTokenTransferMethod: (config == null ? void 0 : config.getTokenTransferMethod) === void 0 ? defaultGetTokenTransferMethod : config.getTokenTransferMethod,
    cookieDomain,
    olderCookieDomain,
    getCookieSameSite: cookieSameSite,
    cookieSecure,
    sessionExpiredStatusCode,
    errorHandlers,
    antiCsrfFunctionOrString: antiCsrf,
    override,
    invalidClaimStatusCode,
    overwriteSessionDuringSignInUp: (_d = config == null ? void 0 : config.overwriteSessionDuringSignInUp) != null ? _d : false,
    jwksRefreshIntervalSec: (_e = config == null ? void 0 : config.jwksRefreshIntervalSec) != null ? _e : 3600 * 4
  };
}
function normaliseSameSiteOrThrowError(sameSite) {
  sameSite = sameSite.trim();
  sameSite = sameSite.toLocaleLowerCase();
  if (sameSite !== "strict" && sameSite !== "lax" && sameSite !== "none") {
    throw new Error(`cookie same site must be one of "strict", "lax", or "none"`);
  }
  return sameSite;
}
function setAccessTokenInResponse(res, accessToken, frontToken, config, transferMethod, req, userContext) {
  (0, import_cookieAndHeaders.setFrontTokenInHeaders)(res, frontToken);
  (0, import_cookieAndHeaders.setToken)(
    config,
    res,
    "access",
    accessToken,
    // We set the expiration to 1 year, because we can't really access the expiration of the refresh token everywhere we are setting it.
    // This should be safe to do, since this is only the validity of the cookie (set here or on the frontend) but we check the expiration of the JWT anyway.
    // Even if the token is expired the presence of the token indicates that the user could have a valid refresh token
    // Some browsers now cap the maximum expiry at 400 days, so we set it to 1 year, which should suffice.
    Date.now() + import_constants.oneYearInMs,
    transferMethod,
    req,
    userContext
  );
  if (config.exposeAccessTokenToFrontendInCookieBasedAuth && transferMethod === "cookie") {
    (0, import_cookieAndHeaders.setToken)(
      config,
      res,
      "access",
      accessToken,
      // We set the expiration to 1 years, because we can't really access the expiration of the refresh token everywhere we are setting it.
      // This should be safe to do, since this is only the validity of the cookie (set here or on the frontend) but we check the expiration of the JWT anyway.
      // Even if the token is expired the presence of the token indicates that the user could have a valid refresh token
      // Some browsers now cap the maximum expiry at 400 days, so we set it to 1 year, which should suffice.
      Date.now() + import_constants.oneYearInMs,
      "header",
      req,
      userContext
    );
  }
}
async function getRequiredClaimValidators(session, overrideGlobalClaimValidators, userContext) {
  const claimValidatorsAddedByOtherRecipes = import_recipe.default.getInstanceOrThrowError().getClaimValidatorsAddedByOtherRecipes();
  const globalClaimValidators = await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.getGlobalClaimValidators(
    {
      userId: session.getUserId(userContext),
      recipeUserId: session.getRecipeUserId(userContext),
      tenantId: session.getTenantId(userContext),
      claimValidatorsAddedByOtherRecipes,
      userContext
    }
  );
  return overrideGlobalClaimValidators !== void 0 ? await overrideGlobalClaimValidators(globalClaimValidators, session, userContext) : globalClaimValidators;
}
async function validateClaimsInPayload(claimValidators, newAccessTokenPayload, userContext) {
  const validationErrors = [];
  for (const validator of claimValidators) {
    const claimValidationResult = await validator.validate(newAccessTokenPayload, userContext);
    (0, import_logger.logDebugMessage)(
      "validateClaimsInPayload " + validator.id + " validation res " + JSON.stringify(claimValidationResult)
    );
    if (!claimValidationResult.isValid) {
      validationErrors.push({
        id: validator.id,
        reason: claimValidationResult.reason
      });
    }
  }
  return validationErrors;
}
function defaultGetTokenTransferMethod({
  req,
  forCreateNewSession
}) {
  if (!forCreateNewSession) {
    return "any";
  }
  switch ((0, import_cookieAndHeaders.getAuthModeFromHeader)(req)) {
    case "header":
      return "header";
    case "cookie":
      return "cookie";
    default:
      return "any";
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getRequiredClaimValidators,
  getURLProtocol,
  normaliseSameSiteOrThrowError,
  normaliseSessionScopeOrThrowError,
  sendInvalidClaimResponse,
  sendTokenTheftDetectedResponse,
  sendTryRefreshTokenResponse,
  sendUnauthorisedResponse,
  setAccessTokenInResponse,
  validateAndNormaliseUserInput,
  validateClaimsInPayload
});