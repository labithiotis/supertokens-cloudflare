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
import * as jose from "jose";
import NormalisedURLDomain from "../../../normalisedURLDomain";
import NormalisedURLPath from "../../../normalisedURLPath";
import { logDebugMessage } from "../../../logger";
import { doFetch } from "../../../utils";
async function doGetRequest(url, queryParams, headers) {
  logDebugMessage(
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
  let response = await doFetch(finalURL.toString(), {
    headers
  });
  const stringResponse = await response.text();
  let jsonResponse = void 0;
  if (response.status < 400) {
    jsonResponse = JSON.parse(stringResponse);
  }
  logDebugMessage(`Received response with status ${response.status} and body ${stringResponse}`);
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
  logDebugMessage(
    `POST request to ${url}, with params ${JSON.stringify(params)} and headers ${JSON.stringify(headers)}`
  );
  const body = new URLSearchParams(params).toString();
  let response = await doFetch(url, {
    method: "POST",
    body,
    headers
  });
  const stringResponse = await response.text();
  let jsonResponse = void 0;
  if (response.status < 400) {
    jsonResponse = JSON.parse(stringResponse);
  }
  logDebugMessage(`Received response with status ${response.status} and body ${stringResponse}`);
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
  const normalizedDomain = new NormalisedURLDomain(issuer);
  const normalizedPath = new NormalisedURLPath(issuer);
  let oidcInfo = await doGetRequest(normalizedDomain.getAsStringDangerous() + normalizedPath.getAsStringDangerous());
  if (oidcInfo.status > 400) {
    logDebugMessage(`Received response with status ${oidcInfo.status} and body ${oidcInfo.stringResponse}`);
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
  const normalisedDomain = new NormalisedURLDomain(url);
  const normalisedPath = new NormalisedURLPath(url);
  const normalisedWellKnownPath = new NormalisedURLPath("/.well-known/openid-configuration");
  return normalisedDomain.getAsStringDangerous() + normalisedPath.getAsStringDangerous() + normalisedWellKnownPath.getAsStringDangerous();
}
export {
  discoverOIDCEndpoints,
  doGetRequest,
  doPostRequest,
  normaliseOIDCEndpointToIncludeWellKnown,
  verifyIdTokenFromJWKSEndpointAndGetPayload
};
