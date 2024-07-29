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
var sessionRequestFunctions_exports = {};
__export(sessionRequestFunctions_exports, {
  createNewSessionInRequest: () => createNewSessionInRequest,
  getSessionFromRequest: () => getSessionFromRequest,
  refreshSessionInRequest: () => refreshSessionInRequest
});
module.exports = __toCommonJS(sessionRequestFunctions_exports);
var import_framework = __toESM(require("../../framework"), 1);
var import_supertokens = __toESM(require("../../supertokens"), 1);
var import_utils = require("./utils");
var import_utils2 = require("../../utils");
var import_logger = require("../../logger");
var import_constants = require("./constants");
var import_cookieAndHeaders = require("./cookieAndHeaders");
var import_jwt = require("./jwt");
var import_accessToken = require("./accessToken");
var import_error = __toESM(require("./error"), 1);
const LEGACY_ID_REFRESH_TOKEN_COOKIE_NAME = "sIdRefreshToken";
async function getSessionFromRequest({
  req,
  res,
  config,
  recipeInterfaceImpl,
  options,
  userContext
}) {
  (0, import_logger.logDebugMessage)("getSession: Started");
  const configuredFramework = import_supertokens.default.getInstanceOrThrowError().framework;
  if (configuredFramework !== "custom") {
    if (!req.wrapperUsed) {
      req = import_framework.default[configuredFramework].wrapRequest(req);
    }
    if (!res.wrapperUsed) {
      res = import_framework.default[configuredFramework].wrapResponse(res);
    }
  }
  userContext = (0, import_utils2.setRequestInUserContextIfNotDefined)(userContext, req);
  (0, import_logger.logDebugMessage)("getSession: Wrapping done");
  if (req.getCookieValue(LEGACY_ID_REFRESH_TOKEN_COOKIE_NAME) !== void 0) {
    (0, import_logger.logDebugMessage)("getSession: Throwing TRY_REFRESH_TOKEN because the request is using a legacy session");
    throw new import_error.default({
      message: "using legacy session, please call the refresh API",
      type: import_error.default.TRY_REFRESH_TOKEN
    });
  }
  const sessionOptional = (options == null ? void 0 : options.sessionRequired) === false;
  (0, import_logger.logDebugMessage)("getSession: optional validation: " + sessionOptional);
  const accessTokens = {};
  for (const transferMethod of import_constants.availableTokenTransferMethods) {
    const tokenString = (0, import_cookieAndHeaders.getToken)(req, "access", transferMethod);
    if (tokenString !== void 0) {
      try {
        const info = (0, import_jwt.parseJWTWithoutSignatureVerification)(tokenString);
        (0, import_accessToken.validateAccessTokenStructure)(info.payload, info.version);
        (0, import_logger.logDebugMessage)("getSession: got access token from " + transferMethod);
        accessTokens[transferMethod] = info;
      } catch (e) {
        (0, import_logger.logDebugMessage)(
          `getSession: ignoring token in ${transferMethod}, because it doesn't match our access token structure`
        );
      }
    }
  }
  const allowedTransferMethod = config.getTokenTransferMethod({
    req,
    forCreateNewSession: false,
    userContext
  });
  let requestTransferMethod;
  let accessToken;
  if ((allowedTransferMethod === "any" || allowedTransferMethod === "header") && accessTokens["header"] !== void 0) {
    (0, import_logger.logDebugMessage)("getSession: using header transfer method");
    requestTransferMethod = "header";
    accessToken = accessTokens["header"];
  } else if ((allowedTransferMethod === "any" || allowedTransferMethod === "cookie") && accessTokens["cookie"] !== void 0) {
    (0, import_logger.logDebugMessage)("getSession: using cookie transfer method");
    const hasMultipleAccessTokenCookies = (0, import_cookieAndHeaders.hasMultipleCookiesForTokenType)(req, "access");
    if (hasMultipleAccessTokenCookies) {
      (0, import_logger.logDebugMessage)(
        "getSession: Throwing TRY_REFRESH_TOKEN because multiple access tokens are present in request cookies"
      );
      throw new import_error.default({
        message: "Multiple access tokens present in the request cookies.",
        type: import_error.default.TRY_REFRESH_TOKEN
      });
    }
    requestTransferMethod = "cookie";
    accessToken = accessTokens["cookie"];
  }
  let antiCsrfToken = (0, import_cookieAndHeaders.getAntiCsrfTokenFromHeaders)(req);
  let doAntiCsrfCheck = options !== void 0 ? options.antiCsrfCheck : void 0;
  if (doAntiCsrfCheck === void 0) {
    doAntiCsrfCheck = (0, import_utils2.normaliseHttpMethod)(req.getMethod()) !== "get";
  }
  if (requestTransferMethod === "header") {
    doAntiCsrfCheck = false;
  }
  if (accessToken === void 0) {
    doAntiCsrfCheck = false;
  }
  let antiCsrf = config.antiCsrfFunctionOrString;
  if (typeof antiCsrf === "function") {
    antiCsrf = antiCsrf({
      request: req,
      userContext
    });
  }
  if (doAntiCsrfCheck && antiCsrf === "VIA_CUSTOM_HEADER") {
    if (antiCsrf === "VIA_CUSTOM_HEADER") {
      if ((0, import_utils2.getRidFromHeader)(req) === void 0) {
        (0, import_logger.logDebugMessage)("getSession: Returning TRY_REFRESH_TOKEN because custom header (rid) was not passed");
        throw new import_error.default({
          message: `anti-csrf check failed. Please pass 'rid: "session"' header in the request, or set doAntiCsrfCheck to false for this API`,
          type: import_error.default.TRY_REFRESH_TOKEN
        });
      }
      (0, import_logger.logDebugMessage)("getSession: VIA_CUSTOM_HEADER anti-csrf check passed");
      doAntiCsrfCheck = false;
    }
  }
  (0, import_logger.logDebugMessage)("getSession: Value of doAntiCsrfCheck is: " + doAntiCsrfCheck);
  const session = await recipeInterfaceImpl.getSession({
    accessToken: accessToken == null ? void 0 : accessToken.rawTokenString,
    antiCsrfToken,
    options: __spreadProps(__spreadValues({}, options), { antiCsrfCheck: doAntiCsrfCheck }),
    userContext
  });
  if (session !== void 0) {
    const claimValidators = await (0, import_utils.getRequiredClaimValidators)(
      session,
      options == null ? void 0 : options.overrideGlobalClaimValidators,
      userContext
    );
    await session.assertClaims(claimValidators, userContext);
    await session.attachToRequestResponse(
      {
        req,
        res,
        transferMethod: requestTransferMethod !== void 0 ? requestTransferMethod : allowedTransferMethod !== "any" ? allowedTransferMethod : "header"
      },
      userContext
    );
  }
  return session;
}
async function refreshSessionInRequest({
  res,
  req,
  userContext,
  config,
  recipeInterfaceImpl
}) {
  (0, import_logger.logDebugMessage)("refreshSession: Started");
  const configuredFramework = import_supertokens.default.getInstanceOrThrowError().framework;
  if (configuredFramework !== "custom") {
    if (!req.wrapperUsed) {
      req = import_framework.default[configuredFramework].wrapRequest(req);
    }
    if (!res.wrapperUsed) {
      res = import_framework.default[configuredFramework].wrapResponse(res);
    }
  }
  userContext = (0, import_utils2.setRequestInUserContextIfNotDefined)(userContext, req);
  (0, import_logger.logDebugMessage)("refreshSession: Wrapping done");
  (0, import_cookieAndHeaders.clearSessionCookiesFromOlderCookieDomain)({ req, res, config, userContext });
  const refreshTokens = {};
  for (const transferMethod of import_constants.availableTokenTransferMethods) {
    refreshTokens[transferMethod] = (0, import_cookieAndHeaders.getToken)(req, "refresh", transferMethod);
    if (refreshTokens[transferMethod] !== void 0) {
      (0, import_logger.logDebugMessage)("refreshSession: got refresh token from " + transferMethod);
    }
  }
  const allowedTransferMethod = config.getTokenTransferMethod({
    req,
    forCreateNewSession: false,
    userContext
  });
  (0, import_logger.logDebugMessage)("refreshSession: getTokenTransferMethod returned " + allowedTransferMethod);
  let requestTransferMethod;
  let refreshToken;
  if ((allowedTransferMethod === "any" || allowedTransferMethod === "header") && refreshTokens["header"] !== void 0) {
    (0, import_logger.logDebugMessage)("refreshSession: using header transfer method");
    requestTransferMethod = "header";
    refreshToken = refreshTokens["header"];
  } else if ((allowedTransferMethod === "any" || allowedTransferMethod === "cookie") && refreshTokens["cookie"]) {
    (0, import_logger.logDebugMessage)("refreshSession: using cookie transfer method");
    requestTransferMethod = "cookie";
    refreshToken = refreshTokens["cookie"];
  } else {
    if (req.getCookieValue(LEGACY_ID_REFRESH_TOKEN_COOKIE_NAME) !== void 0) {
      (0, import_logger.logDebugMessage)("refreshSession: cleared legacy id refresh token because refresh token was not found");
      (0, import_cookieAndHeaders.setCookie)(config, res, LEGACY_ID_REFRESH_TOKEN_COOKIE_NAME, "", 0, "accessTokenPath", req, userContext);
    }
    if ((allowedTransferMethod === "any" || allowedTransferMethod === "cookie") && (0, import_cookieAndHeaders.getToken)(req, "access", "cookie") !== void 0) {
      (0, import_logger.logDebugMessage)(
        "refreshSession: cleared all session tokens and returning UNAUTHORISED because refresh token in request is undefined"
      );
      throw new import_error.default({
        message: "Refresh token not found but access token is present. Clearing all tokens.",
        payload: {
          clearTokens: true
        },
        type: import_error.default.UNAUTHORISED
      });
    }
    throw new import_error.default({
      message: "Refresh token not found. Are you sending the refresh token in the request?",
      payload: {
        clearTokens: true
      },
      type: import_error.default.UNAUTHORISED
    });
  }
  let disableAntiCsrf = requestTransferMethod === "header";
  const antiCsrfToken = (0, import_cookieAndHeaders.getAntiCsrfTokenFromHeaders)(req);
  let antiCsrf = config.antiCsrfFunctionOrString;
  if (typeof antiCsrf === "function") {
    antiCsrf = antiCsrf({
      request: req,
      userContext
    });
  }
  if (antiCsrf === "VIA_CUSTOM_HEADER" && !disableAntiCsrf) {
    if ((0, import_utils2.getRidFromHeader)(req) === void 0) {
      (0, import_logger.logDebugMessage)("refreshSession: Returning UNAUTHORISED because custom header (rid) was not passed");
      throw new import_error.default({
        message: `anti-csrf check failed. Please pass 'rid: "session"' header in the request.`,
        type: import_error.default.UNAUTHORISED,
        payload: {
          clearTokens: true
          // see https://github.com/supertokens/supertokens-node/issues/141
        }
      });
    }
    disableAntiCsrf = true;
  }
  let session;
  try {
    session = await recipeInterfaceImpl.refreshSession({
      refreshToken,
      antiCsrfToken,
      disableAntiCsrf,
      userContext
    });
  } catch (ex) {
    if (import_error.default.isErrorFromSuperTokens(ex) && (ex.type === import_error.default.TOKEN_THEFT_DETECTED || ex.payload.clearTokens === true)) {
      if (req.getCookieValue(LEGACY_ID_REFRESH_TOKEN_COOKIE_NAME) !== void 0) {
        (0, import_logger.logDebugMessage)(
          "refreshSession: cleared legacy id refresh token because refresh is clearing other tokens"
        );
        (0, import_cookieAndHeaders.setCookie)(config, res, LEGACY_ID_REFRESH_TOKEN_COOKIE_NAME, "", 0, "accessTokenPath", req, userContext);
      }
    }
    throw ex;
  }
  (0, import_logger.logDebugMessage)("refreshSession: Attaching refreshed session info as " + requestTransferMethod);
  for (const transferMethod of import_constants.availableTokenTransferMethods) {
    if (transferMethod !== requestTransferMethod && refreshTokens[transferMethod] !== void 0) {
      (0, import_cookieAndHeaders.clearSession)(config, res, transferMethod, req, userContext);
    }
  }
  await session.attachToRequestResponse(
    {
      req,
      res,
      transferMethod: requestTransferMethod
    },
    userContext
  );
  (0, import_logger.logDebugMessage)("refreshSession: Success!");
  if (req.getCookieValue(LEGACY_ID_REFRESH_TOKEN_COOKIE_NAME) !== void 0) {
    (0, import_logger.logDebugMessage)("refreshSession: cleared legacy id refresh token after successful refresh");
    (0, import_cookieAndHeaders.setCookie)(config, res, LEGACY_ID_REFRESH_TOKEN_COOKIE_NAME, "", 0, "accessTokenPath", req, userContext);
  }
  return session;
}
async function createNewSessionInRequest({
  req,
  res,
  userContext,
  recipeInstance,
  accessTokenPayload,
  userId,
  recipeUserId,
  config,
  appInfo,
  sessionDataInDatabase,
  tenantId
}) {
  (0, import_logger.logDebugMessage)("createNewSession: Started");
  const configuredFramework = import_supertokens.default.getInstanceOrThrowError().framework;
  if (configuredFramework !== "custom") {
    if (!req.wrapperUsed) {
      req = import_framework.default[configuredFramework].wrapRequest(req);
    }
    if (!res.wrapperUsed) {
      res = import_framework.default[configuredFramework].wrapResponse(res);
    }
  }
  (0, import_logger.logDebugMessage)("createNewSession: Wrapping done");
  userContext = (0, import_utils2.setRequestInUserContextIfNotDefined)(userContext, req);
  const claimsAddedByOtherRecipes = recipeInstance.getClaimsAddedByOtherRecipes();
  const issuer = appInfo.apiDomain.getAsStringDangerous() + appInfo.apiBasePath.getAsStringDangerous();
  let finalAccessTokenPayload = __spreadProps(__spreadValues({}, accessTokenPayload), {
    iss: issuer
  });
  for (const prop of import_constants.protectedProps) {
    delete finalAccessTokenPayload[prop];
  }
  for (const claim of claimsAddedByOtherRecipes) {
    const update = await claim.build(userId, recipeUserId, tenantId, finalAccessTokenPayload, userContext);
    finalAccessTokenPayload = __spreadValues(__spreadValues({}, finalAccessTokenPayload), update);
  }
  (0, import_logger.logDebugMessage)("createNewSession: Access token payload built");
  let outputTransferMethod = config.getTokenTransferMethod({ req, forCreateNewSession: true, userContext });
  if (outputTransferMethod === "any") {
    const authModeHeader = (0, import_cookieAndHeaders.getAuthModeFromHeader)(req);
    if (authModeHeader === "cookie") {
      outputTransferMethod = authModeHeader;
    } else {
      outputTransferMethod = "header";
    }
  }
  (0, import_logger.logDebugMessage)("createNewSession: using transfer method " + outputTransferMethod);
  if (outputTransferMethod === "cookie" && config.getCookieSameSite({
    request: req,
    userContext
  }) === "none" && !config.cookieSecure && !((appInfo.topLevelAPIDomain === "localhost" || (0, import_utils2.isAnIpAddress)(appInfo.topLevelAPIDomain)) && (appInfo.getTopLevelWebsiteDomain({
    request: req,
    userContext
  }) === "localhost" || (0, import_utils2.isAnIpAddress)(
    appInfo.getTopLevelWebsiteDomain({
      request: req,
      userContext
    })
  )))) {
    throw new Error(
      "Since your API and website domain are different, for sessions to work, please use https on your apiDomain and dont set cookieSecure to false."
    );
  }
  const disableAntiCsrf = outputTransferMethod === "header";
  const session = await recipeInstance.recipeInterfaceImpl.createNewSession({
    userId,
    recipeUserId,
    accessTokenPayload: finalAccessTokenPayload,
    sessionDataInDatabase,
    disableAntiCsrf,
    tenantId,
    userContext
  });
  (0, import_logger.logDebugMessage)("createNewSession: Session created in core built");
  for (const transferMethod of import_constants.availableTokenTransferMethods) {
    if (transferMethod !== outputTransferMethod && (0, import_cookieAndHeaders.getToken)(req, "access", transferMethod) !== void 0) {
      (0, import_cookieAndHeaders.clearSession)(config, res, transferMethod, req, userContext);
    }
  }
  (0, import_logger.logDebugMessage)("createNewSession: Cleared old tokens");
  await session.attachToRequestResponse(
    {
      req,
      res,
      transferMethod: outputTransferMethod
    },
    userContext
  );
  (0, import_logger.logDebugMessage)("createNewSession: Attached new tokens to res");
  return session;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createNewSessionInRequest,
  getSessionFromRequest,
  refreshSessionInRequest
});
