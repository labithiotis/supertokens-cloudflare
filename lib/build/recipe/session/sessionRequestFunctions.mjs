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
import frameworks from "../../framework";
import SuperTokens from "../../supertokens";
import { getRequiredClaimValidators } from "./utils";
import { getRidFromHeader, isAnIpAddress, normaliseHttpMethod, setRequestInUserContextIfNotDefined } from "../../utils";
import { logDebugMessage } from "../../logger";
import { availableTokenTransferMethods, protectedProps } from "./constants";
import {
  clearSession,
  clearSessionCookiesFromOlderCookieDomain,
  getAntiCsrfTokenFromHeaders,
  getAuthModeFromHeader,
  getToken,
  hasMultipleCookiesForTokenType,
  setCookie
} from "./cookieAndHeaders";
import { parseJWTWithoutSignatureVerification } from "./jwt";
import { validateAccessTokenStructure } from "./accessToken";
import SessionError from "./error";
const LEGACY_ID_REFRESH_TOKEN_COOKIE_NAME = "sIdRefreshToken";
async function getSessionFromRequest({
  req,
  res,
  config,
  recipeInterfaceImpl,
  options,
  userContext
}) {
  logDebugMessage("getSession: Started");
  const configuredFramework = SuperTokens.getInstanceOrThrowError().framework;
  if (configuredFramework !== "custom") {
    if (!req.wrapperUsed) {
      req = frameworks[configuredFramework].wrapRequest(req);
    }
    if (!res.wrapperUsed) {
      res = frameworks[configuredFramework].wrapResponse(res);
    }
  }
  userContext = setRequestInUserContextIfNotDefined(userContext, req);
  logDebugMessage("getSession: Wrapping done");
  if (req.getCookieValue(LEGACY_ID_REFRESH_TOKEN_COOKIE_NAME) !== void 0) {
    logDebugMessage("getSession: Throwing TRY_REFRESH_TOKEN because the request is using a legacy session");
    throw new SessionError({
      message: "using legacy session, please call the refresh API",
      type: SessionError.TRY_REFRESH_TOKEN
    });
  }
  const sessionOptional = (options == null ? void 0 : options.sessionRequired) === false;
  logDebugMessage("getSession: optional validation: " + sessionOptional);
  const accessTokens = {};
  for (const transferMethod of availableTokenTransferMethods) {
    const tokenString = getToken(req, "access", transferMethod);
    if (tokenString !== void 0) {
      try {
        const info = parseJWTWithoutSignatureVerification(tokenString);
        validateAccessTokenStructure(info.payload, info.version);
        logDebugMessage("getSession: got access token from " + transferMethod);
        accessTokens[transferMethod] = info;
      } catch (e) {
        logDebugMessage(
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
    logDebugMessage("getSession: using header transfer method");
    requestTransferMethod = "header";
    accessToken = accessTokens["header"];
  } else if ((allowedTransferMethod === "any" || allowedTransferMethod === "cookie") && accessTokens["cookie"] !== void 0) {
    logDebugMessage("getSession: using cookie transfer method");
    const hasMultipleAccessTokenCookies = hasMultipleCookiesForTokenType(req, "access");
    if (hasMultipleAccessTokenCookies) {
      logDebugMessage(
        "getSession: Throwing TRY_REFRESH_TOKEN because multiple access tokens are present in request cookies"
      );
      throw new SessionError({
        message: "Multiple access tokens present in the request cookies.",
        type: SessionError.TRY_REFRESH_TOKEN
      });
    }
    requestTransferMethod = "cookie";
    accessToken = accessTokens["cookie"];
  }
  let antiCsrfToken = getAntiCsrfTokenFromHeaders(req);
  let doAntiCsrfCheck = options !== void 0 ? options.antiCsrfCheck : void 0;
  if (doAntiCsrfCheck === void 0) {
    doAntiCsrfCheck = normaliseHttpMethod(req.getMethod()) !== "get";
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
      if (getRidFromHeader(req) === void 0) {
        logDebugMessage("getSession: Returning TRY_REFRESH_TOKEN because custom header (rid) was not passed");
        throw new SessionError({
          message: `anti-csrf check failed. Please pass 'rid: "session"' header in the request, or set doAntiCsrfCheck to false for this API`,
          type: SessionError.TRY_REFRESH_TOKEN
        });
      }
      logDebugMessage("getSession: VIA_CUSTOM_HEADER anti-csrf check passed");
      doAntiCsrfCheck = false;
    }
  }
  logDebugMessage("getSession: Value of doAntiCsrfCheck is: " + doAntiCsrfCheck);
  const session = await recipeInterfaceImpl.getSession({
    accessToken: accessToken == null ? void 0 : accessToken.rawTokenString,
    antiCsrfToken,
    options: __spreadProps(__spreadValues({}, options), { antiCsrfCheck: doAntiCsrfCheck }),
    userContext
  });
  if (session !== void 0) {
    const claimValidators = await getRequiredClaimValidators(
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
  logDebugMessage("refreshSession: Started");
  const configuredFramework = SuperTokens.getInstanceOrThrowError().framework;
  if (configuredFramework !== "custom") {
    if (!req.wrapperUsed) {
      req = frameworks[configuredFramework].wrapRequest(req);
    }
    if (!res.wrapperUsed) {
      res = frameworks[configuredFramework].wrapResponse(res);
    }
  }
  userContext = setRequestInUserContextIfNotDefined(userContext, req);
  logDebugMessage("refreshSession: Wrapping done");
  clearSessionCookiesFromOlderCookieDomain({ req, res, config, userContext });
  const refreshTokens = {};
  for (const transferMethod of availableTokenTransferMethods) {
    refreshTokens[transferMethod] = getToken(req, "refresh", transferMethod);
    if (refreshTokens[transferMethod] !== void 0) {
      logDebugMessage("refreshSession: got refresh token from " + transferMethod);
    }
  }
  const allowedTransferMethod = config.getTokenTransferMethod({
    req,
    forCreateNewSession: false,
    userContext
  });
  logDebugMessage("refreshSession: getTokenTransferMethod returned " + allowedTransferMethod);
  let requestTransferMethod;
  let refreshToken;
  if ((allowedTransferMethod === "any" || allowedTransferMethod === "header") && refreshTokens["header"] !== void 0) {
    logDebugMessage("refreshSession: using header transfer method");
    requestTransferMethod = "header";
    refreshToken = refreshTokens["header"];
  } else if ((allowedTransferMethod === "any" || allowedTransferMethod === "cookie") && refreshTokens["cookie"]) {
    logDebugMessage("refreshSession: using cookie transfer method");
    requestTransferMethod = "cookie";
    refreshToken = refreshTokens["cookie"];
  } else {
    if (req.getCookieValue(LEGACY_ID_REFRESH_TOKEN_COOKIE_NAME) !== void 0) {
      logDebugMessage("refreshSession: cleared legacy id refresh token because refresh token was not found");
      setCookie(config, res, LEGACY_ID_REFRESH_TOKEN_COOKIE_NAME, "", 0, "accessTokenPath", req, userContext);
    }
    if ((allowedTransferMethod === "any" || allowedTransferMethod === "cookie") && getToken(req, "access", "cookie") !== void 0) {
      logDebugMessage(
        "refreshSession: cleared all session tokens and returning UNAUTHORISED because refresh token in request is undefined"
      );
      throw new SessionError({
        message: "Refresh token not found but access token is present. Clearing all tokens.",
        payload: {
          clearTokens: true
        },
        type: SessionError.UNAUTHORISED
      });
    }
    throw new SessionError({
      message: "Refresh token not found. Are you sending the refresh token in the request?",
      payload: {
        clearTokens: true
      },
      type: SessionError.UNAUTHORISED
    });
  }
  let disableAntiCsrf = requestTransferMethod === "header";
  const antiCsrfToken = getAntiCsrfTokenFromHeaders(req);
  let antiCsrf = config.antiCsrfFunctionOrString;
  if (typeof antiCsrf === "function") {
    antiCsrf = antiCsrf({
      request: req,
      userContext
    });
  }
  if (antiCsrf === "VIA_CUSTOM_HEADER" && !disableAntiCsrf) {
    if (getRidFromHeader(req) === void 0) {
      logDebugMessage("refreshSession: Returning UNAUTHORISED because custom header (rid) was not passed");
      throw new SessionError({
        message: `anti-csrf check failed. Please pass 'rid: "session"' header in the request.`,
        type: SessionError.UNAUTHORISED,
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
    if (SessionError.isErrorFromSuperTokens(ex) && (ex.type === SessionError.TOKEN_THEFT_DETECTED || ex.payload.clearTokens === true)) {
      if (req.getCookieValue(LEGACY_ID_REFRESH_TOKEN_COOKIE_NAME) !== void 0) {
        logDebugMessage(
          "refreshSession: cleared legacy id refresh token because refresh is clearing other tokens"
        );
        setCookie(config, res, LEGACY_ID_REFRESH_TOKEN_COOKIE_NAME, "", 0, "accessTokenPath", req, userContext);
      }
    }
    throw ex;
  }
  logDebugMessage("refreshSession: Attaching refreshed session info as " + requestTransferMethod);
  for (const transferMethod of availableTokenTransferMethods) {
    if (transferMethod !== requestTransferMethod && refreshTokens[transferMethod] !== void 0) {
      clearSession(config, res, transferMethod, req, userContext);
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
  logDebugMessage("refreshSession: Success!");
  if (req.getCookieValue(LEGACY_ID_REFRESH_TOKEN_COOKIE_NAME) !== void 0) {
    logDebugMessage("refreshSession: cleared legacy id refresh token after successful refresh");
    setCookie(config, res, LEGACY_ID_REFRESH_TOKEN_COOKIE_NAME, "", 0, "accessTokenPath", req, userContext);
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
  logDebugMessage("createNewSession: Started");
  const configuredFramework = SuperTokens.getInstanceOrThrowError().framework;
  if (configuredFramework !== "custom") {
    if (!req.wrapperUsed) {
      req = frameworks[configuredFramework].wrapRequest(req);
    }
    if (!res.wrapperUsed) {
      res = frameworks[configuredFramework].wrapResponse(res);
    }
  }
  logDebugMessage("createNewSession: Wrapping done");
  userContext = setRequestInUserContextIfNotDefined(userContext, req);
  const claimsAddedByOtherRecipes = recipeInstance.getClaimsAddedByOtherRecipes();
  const issuer = appInfo.apiDomain.getAsStringDangerous() + appInfo.apiBasePath.getAsStringDangerous();
  let finalAccessTokenPayload = __spreadProps(__spreadValues({}, accessTokenPayload), {
    iss: issuer
  });
  for (const prop of protectedProps) {
    delete finalAccessTokenPayload[prop];
  }
  for (const claim of claimsAddedByOtherRecipes) {
    const update = await claim.build(userId, recipeUserId, tenantId, finalAccessTokenPayload, userContext);
    finalAccessTokenPayload = __spreadValues(__spreadValues({}, finalAccessTokenPayload), update);
  }
  logDebugMessage("createNewSession: Access token payload built");
  let outputTransferMethod = config.getTokenTransferMethod({ req, forCreateNewSession: true, userContext });
  if (outputTransferMethod === "any") {
    const authModeHeader = getAuthModeFromHeader(req);
    if (authModeHeader === "cookie") {
      outputTransferMethod = authModeHeader;
    } else {
      outputTransferMethod = "header";
    }
  }
  logDebugMessage("createNewSession: using transfer method " + outputTransferMethod);
  if (outputTransferMethod === "cookie" && config.getCookieSameSite({
    request: req,
    userContext
  }) === "none" && !config.cookieSecure && !((appInfo.topLevelAPIDomain === "localhost" || isAnIpAddress(appInfo.topLevelAPIDomain)) && (appInfo.getTopLevelWebsiteDomain({
    request: req,
    userContext
  }) === "localhost" || isAnIpAddress(
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
  logDebugMessage("createNewSession: Session created in core built");
  for (const transferMethod of availableTokenTransferMethods) {
    if (transferMethod !== outputTransferMethod && getToken(req, "access", transferMethod) !== void 0) {
      clearSession(config, res, transferMethod, req, userContext);
    }
  }
  logDebugMessage("createNewSession: Cleared old tokens");
  await session.attachToRequestResponse(
    {
      req,
      res,
      transferMethod: outputTransferMethod
    },
    userContext
  );
  logDebugMessage("createNewSession: Attached new tokens to res");
  return session;
}
export {
  createNewSessionInRequest,
  getSessionFromRequest,
  refreshSessionInRequest
};
