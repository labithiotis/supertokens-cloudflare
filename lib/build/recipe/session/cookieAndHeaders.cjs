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
var cookieAndHeaders_exports = {};
__export(cookieAndHeaders_exports, {
  buildFrontToken: () => buildFrontToken,
  clearSession: () => clearSession,
  clearSessionCookiesFromOlderCookieDomain: () => clearSessionCookiesFromOlderCookieDomain,
  clearSessionFromAllTokenTransferMethods: () => clearSessionFromAllTokenTransferMethods,
  getAntiCsrfTokenFromHeaders: () => getAntiCsrfTokenFromHeaders,
  getAuthModeFromHeader: () => getAuthModeFromHeader,
  getCORSAllowedHeaders: () => getCORSAllowedHeaders,
  getCookieNameFromTokenType: () => getCookieNameFromTokenType,
  getResponseHeaderNameForTokenType: () => getResponseHeaderNameForTokenType,
  getToken: () => getToken,
  hasMultipleCookiesForTokenType: () => hasMultipleCookiesForTokenType,
  setAntiCsrfTokenInHeaders: () => setAntiCsrfTokenInHeaders,
  setCookie: () => setCookie,
  setFrontTokenInHeaders: () => setFrontTokenInHeaders,
  setHeader: () => setHeader,
  setToken: () => setToken
});
module.exports = __toCommonJS(cookieAndHeaders_exports);
var import_constants = require("../../constants");
var import_logger = require("../../logger");
var import_constants2 = require("./constants");
var import_error = __toESM(require("./error"), 1);
var import_node_buffer = require("node:buffer");
const authorizationHeaderKey = "authorization";
const accessTokenCookieKey = "sAccessToken";
const accessTokenHeaderKey = "st-access-token";
const refreshTokenCookieKey = "sRefreshToken";
const refreshTokenHeaderKey = "st-refresh-token";
const antiCsrfHeaderKey = "anti-csrf";
const frontTokenHeaderKey = "front-token";
const authModeHeaderKey = "st-auth-mode";
function clearSessionFromAllTokenTransferMethods(config, res, request, userContext) {
  for (const transferMethod of import_constants2.availableTokenTransferMethods) {
    clearSession(config, res, transferMethod, request, userContext);
  }
}
function clearSession(config, res, transferMethod, request, userContext) {
  const tokenTypes = ["access", "refresh"];
  for (const token of tokenTypes) {
    setToken(config, res, token, "", 0, transferMethod, request, userContext);
  }
  res.removeHeader(antiCsrfHeaderKey);
  res.setHeader(frontTokenHeaderKey, "remove", false);
  res.setHeader("Access-Control-Expose-Headers", frontTokenHeaderKey, true);
}
function getAntiCsrfTokenFromHeaders(req) {
  return req.getHeaderValue(antiCsrfHeaderKey);
}
function setAntiCsrfTokenInHeaders(res, antiCsrfToken) {
  res.setHeader(antiCsrfHeaderKey, antiCsrfToken, false);
  res.setHeader("Access-Control-Expose-Headers", antiCsrfHeaderKey, true);
}
function buildFrontToken(userId, atExpiry, accessTokenPayload) {
  const tokenInfo = {
    uid: userId,
    ate: atExpiry,
    up: accessTokenPayload
  };
  return import_node_buffer.Buffer.from(JSON.stringify(tokenInfo)).toString("base64");
}
function setFrontTokenInHeaders(res, frontToken) {
  res.setHeader(frontTokenHeaderKey, frontToken, false);
  res.setHeader("Access-Control-Expose-Headers", frontTokenHeaderKey, true);
}
function getCORSAllowedHeaders() {
  return [antiCsrfHeaderKey, import_constants.HEADER_RID, authorizationHeaderKey, authModeHeaderKey];
}
function getCookieNameFromTokenType(tokenType) {
  switch (tokenType) {
    case "access":
      return accessTokenCookieKey;
    case "refresh":
      return refreshTokenCookieKey;
    default:
      throw new Error("Unknown token type, should never happen.");
  }
}
function getResponseHeaderNameForTokenType(tokenType) {
  switch (tokenType) {
    case "access":
      return accessTokenHeaderKey;
    case "refresh":
      return refreshTokenHeaderKey;
    default:
      throw new Error("Unknown token type, should never happen.");
  }
}
function getToken(req, tokenType, transferMethod) {
  if (transferMethod === "cookie") {
    return req.getCookieValue(getCookieNameFromTokenType(tokenType));
  } else if (transferMethod === "header") {
    const value = req.getHeaderValue(authorizationHeaderKey);
    if (value === void 0 || !value.startsWith("Bearer ")) {
      return void 0;
    }
    return value.replace(/^Bearer /, "").trim();
  } else {
    throw new Error("Should never happen: Unknown transferMethod: " + transferMethod);
  }
}
function setToken(config, res, tokenType, value, expires, transferMethod, req, userContext) {
  (0, import_logger.logDebugMessage)(`setToken: Setting ${tokenType} token as ${transferMethod}`);
  if (transferMethod === "cookie") {
    setCookie(
      config,
      res,
      getCookieNameFromTokenType(tokenType),
      value,
      expires,
      tokenType === "refresh" ? "refreshTokenPath" : "accessTokenPath",
      req,
      userContext
    );
  } else if (transferMethod === "header") {
    setHeader(res, getResponseHeaderNameForTokenType(tokenType), value);
  }
}
function setHeader(res, name, value) {
  res.setHeader(name, value, false);
  res.setHeader("Access-Control-Expose-Headers", name, true);
}
function setCookie(config, res, name, value, expires, pathType, req, userContext) {
  let domain = config.cookieDomain;
  let secure = config.cookieSecure;
  let sameSite = config.getCookieSameSite({
    request: req,
    userContext
  });
  let path = "";
  if (pathType === "refreshTokenPath") {
    path = config.refreshTokenPath.getAsStringDangerous();
  } else if (pathType === "accessTokenPath") {
    path = config.accessTokenPath.getAsStringDangerous() === "" ? "/" : config.accessTokenPath.getAsStringDangerous();
  }
  let httpOnly = true;
  return res.setCookie(name, value, domain, secure, httpOnly, expires, path, sameSite);
}
function getAuthModeFromHeader(req) {
  var _a;
  return (_a = req.getHeaderValue(authModeHeaderKey)) == null ? void 0 : _a.toLowerCase();
}
function clearSessionCookiesFromOlderCookieDomain({
  req,
  res,
  config,
  userContext
}) {
  const allowedTransferMethod = config.getTokenTransferMethod({
    req,
    forCreateNewSession: false,
    userContext
  });
  if (allowedTransferMethod === "header") {
    return;
  }
  let didClearCookies = false;
  const tokenTypes = ["access", "refresh"];
  for (const token of tokenTypes) {
    if (hasMultipleCookiesForTokenType(req, token)) {
      if (config.olderCookieDomain === void 0) {
        throw new Error(
          `The request contains multiple session cookies. This may happen if you've changed the 'cookieDomain' value in your configuration. To clear tokens from the previous domain, set 'olderCookieDomain' in your config.`
        );
      }
      (0, import_logger.logDebugMessage)(
        `clearSessionCookiesFromOlderCookieDomain: Clearing duplicate ${token} cookie with domain ${config.olderCookieDomain}`
      );
      setToken(
        __spreadProps(__spreadValues({}, config), { cookieDomain: config.olderCookieDomain }),
        res,
        token,
        "",
        0,
        "cookie",
        req,
        userContext
      );
      didClearCookies = true;
    }
  }
  if (didClearCookies) {
    throw new import_error.default({
      message: "The request contains multiple session cookies. We are clearing the cookie from olderCookieDomain. Session will be refreshed in the next refresh call.",
      type: import_error.default.CLEAR_DUPLICATE_SESSION_COOKIES
    });
  }
}
function hasMultipleCookiesForTokenType(req, tokenType) {
  const cookieString = req.getHeaderValue("cookie");
  if (cookieString === void 0) {
    return false;
  }
  const cookies = parseCookieStringFromRequestHeaderAllowingDuplicates(cookieString);
  const cookieName = getCookieNameFromTokenType(tokenType);
  return cookies[cookieName] !== void 0 && cookies[cookieName].length > 1;
}
function parseCookieStringFromRequestHeaderAllowingDuplicates(cookieString) {
  const cookies = {};
  const cookiePairs = cookieString.split(";");
  for (const cookiePair of cookiePairs) {
    const [name, value] = cookiePair.trim().split("=").map((part) => decodeURIComponent(part));
    if (cookies.hasOwnProperty(name)) {
      cookies[name].push(value);
    } else {
      cookies[name] = [value];
    }
  }
  return cookies;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildFrontToken,
  clearSession,
  clearSessionCookiesFromOlderCookieDomain,
  clearSessionFromAllTokenTransferMethods,
  getAntiCsrfTokenFromHeaders,
  getAuthModeFromHeader,
  getCORSAllowedHeaders,
  getCookieNameFromTokenType,
  getResponseHeaderNameForTokenType,
  getToken,
  hasMultipleCookiesForTokenType,
  setAntiCsrfTokenInHeaders,
  setCookie,
  setFrontTokenInHeaders,
  setHeader,
  setToken
});
