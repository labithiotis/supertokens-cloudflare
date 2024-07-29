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
var utils_exports = {};
__export(utils_exports, {
  discoverOIDCEndpoints: () => discoverOIDCEndpoints,
  doGetRequest: () => doGetRequest,
  doPostRequest: () => doPostRequest,
  normaliseOIDCEndpointToIncludeWellKnown: () => normaliseOIDCEndpointToIncludeWellKnown,
  verifyIdTokenFromJWKSEndpointAndGetPayload: () => verifyIdTokenFromJWKSEndpointAndGetPayload
});
module.exports = __toCommonJS(utils_exports);
var jose = __toESM(require("jose"), 1);
var import_normalisedURLDomain = __toESM(require("../../../normalisedURLDomain"), 1);
var import_normalisedURLPath = __toESM(require("../../../normalisedURLPath"), 1);
var import_logger = require("../../../logger");
var import_utils = require("../../../utils");
async function doGetRequest(url, queryParams, headers) {
  (0, import_logger.logDebugMessage)(
    `GET request to ${url}, with query params ${JSON.stringify(queryParams)} and headers ${JSON.stringify(headers)}`
  );
  if ((headers == null ? void 0 : headers["Accept"]) === void 0) {
    headers = __spreadProps(__spreadValues({}, headers), {
      Accept: "application/json"
      // few providers like github don't send back json response by default
    });
  }
  const finalURL = new URL(url);
  finalURL.search = new URLSearchParams(queryParams).toString();
  let response = await (0, import_utils.doFetch)(finalURL.toString(), {
    headers
  });
  const stringResponse = await response.text();
  let jsonResponse = void 0;
  if (response.status < 400) {
    jsonResponse = JSON.parse(stringResponse);
  }
  (0, import_logger.logDebugMessage)(`Received response with status ${response.status} and body ${stringResponse}`);
  return {
    stringResponse,
    status: response.status,
    jsonResponse
  };
}
async function doPostRequest(url, params, headers) {
  if (headers === void 0) {
    headers = {};
  }
  headers["Content-Type"] = "application/x-www-form-urlencoded";
  headers["Accept"] = "application/json";
  (0, import_logger.logDebugMessage)(
    `POST request to ${url}, with params ${JSON.stringify(params)} and headers ${JSON.stringify(headers)}`
  );
  const body = new URLSearchParams(params).toString();
  let response = await (0, import_utils.doFetch)(url, {
    method: "POST",
    body,
    headers
  });
  const stringResponse = await response.text();
  let jsonResponse = void 0;
  if (response.status < 400) {
    jsonResponse = JSON.parse(stringResponse);
  }
  (0, import_logger.logDebugMessage)(`Received response with status ${response.status} and body ${stringResponse}`);
  return {
    stringResponse,
    status: response.status,
    jsonResponse
  };
}
async function verifyIdTokenFromJWKSEndpointAndGetPayload(idToken, jwks, otherOptions) {
  const { payload } = await jose.jwtVerify(idToken, jwks, otherOptions);
  return payload;
}
var oidcInfoMap = {};
async function getOIDCDiscoveryInfo(issuer) {
  if (oidcInfoMap[issuer] !== void 0) {
    return oidcInfoMap[issuer];
  }
  const normalizedDomain = new import_normalisedURLDomain.default(issuer);
  const normalizedPath = new import_normalisedURLPath.default(issuer);
  let oidcInfo = await doGetRequest(normalizedDomain.getAsStringDangerous() + normalizedPath.getAsStringDangerous());
  if (oidcInfo.status > 400) {
    (0, import_logger.logDebugMessage)(`Received response with status ${oidcInfo.status} and body ${oidcInfo.stringResponse}`);
    throw new Error(`Received response with status ${oidcInfo.status} and body ${oidcInfo.stringResponse}`);
  }
  oidcInfoMap[issuer] = oidcInfo.jsonResponse;
  return oidcInfo.jsonResponse;
}
async function discoverOIDCEndpoints(config) {
  if (config.oidcDiscoveryEndpoint !== void 0) {
    const oidcInfo = await getOIDCDiscoveryInfo(config.oidcDiscoveryEndpoint);
    if (oidcInfo.authorization_endpoint !== void 0 && config.authorizationEndpoint === void 0) {
      config.authorizationEndpoint = oidcInfo.authorization_endpoint;
    }
    if (oidcInfo.token_endpoint !== void 0 && config.tokenEndpoint === void 0) {
      config.tokenEndpoint = oidcInfo.token_endpoint;
    }
    if (oidcInfo.userinfo_endpoint !== void 0 && config.userInfoEndpoint === void 0) {
      config.userInfoEndpoint = oidcInfo.userinfo_endpoint;
    }
    if (oidcInfo.jwks_uri !== void 0 && config.jwksURI === void 0) {
      config.jwksURI = oidcInfo.jwks_uri;
    }
  }
}
function normaliseOIDCEndpointToIncludeWellKnown(url) {
  if (url.endsWith("/.well-known/openid-configuration") === true) {
    return url;
  }
  const normalisedDomain = new import_normalisedURLDomain.default(url);
  const normalisedPath = new import_normalisedURLPath.default(url);
  const normalisedWellKnownPath = new import_normalisedURLPath.default("/.well-known/openid-configuration");
  return normalisedDomain.getAsStringDangerous() + normalisedPath.getAsStringDangerous() + normalisedWellKnownPath.getAsStringDangerous();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  discoverOIDCEndpoints,
  doGetRequest,
  doPostRequest,
  normaliseOIDCEndpointToIncludeWellKnown,
  verifyIdTokenFromJWKSEndpointAndGetPayload
});
