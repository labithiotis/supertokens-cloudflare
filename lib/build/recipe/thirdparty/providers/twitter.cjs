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
var twitter_exports = {};
__export(twitter_exports, {
  default: () => Twitter
});
module.exports = __toCommonJS(twitter_exports);
var import_logger = require("../../../logger");
var import_custom = __toESM(require("./custom"), 1);
var import_utils = require("./utils");
var import_node_buffer = require("node:buffer");
function Twitter(input) {
  var _a;
  if (input.config.name === void 0) {
    input.config.name = "Twitter";
  }
  if (input.config.authorizationEndpoint === void 0) {
    input.config.authorizationEndpoint = "https://twitter.com/i/oauth2/authorize";
  }
  if (input.config.tokenEndpoint === void 0) {
    input.config.tokenEndpoint = "https://api.twitter.com/2/oauth2/token";
  }
  if (input.config.userInfoEndpoint === void 0) {
    input.config.userInfoEndpoint = "https://api.twitter.com/2/users/me";
  }
  if (input.config.requireEmail === void 0) {
    input.config.requireEmail = false;
  }
  input.config.userInfoMap = __spreadValues({
    fromUserInfoAPI: __spreadValues({
      userId: "data.id"
    }, (_a = input.config.userInfoMap) == null ? void 0 : _a.fromUserInfoAPI)
  }, input.config.userInfoMap);
  const oOverride = input.override;
  input.override = function(originalImplementation) {
    const oGetConfig = originalImplementation.getConfigForClientType;
    originalImplementation.getConfigForClientType = async function(input2) {
      const config = await oGetConfig(input2);
      if (config.scope === void 0) {
        config.scope = ["users.read", "tweet.read"];
      }
      if (config.forcePKCE === void 0) {
        config.forcePKCE = true;
      }
      return config;
    };
    originalImplementation.exchangeAuthCodeForOAuthTokens = async function(input2) {
      let clientId = originalImplementation.config.clientId;
      let redirectUri = input2.redirectURIInfo.redirectURIOnProviderDashboard;
      if ((0, import_custom.isUsingDevelopmentClientId)(originalImplementation.config.clientId)) {
        clientId = (0, import_custom.getActualClientIdFromDevelopmentClientId)(originalImplementation.config.clientId);
        redirectUri = import_custom.DEV_OAUTH_REDIRECT_URL;
      }
      const basicAuthToken = import_node_buffer.Buffer.from(
        `${clientId}:${originalImplementation.config.clientSecret}`,
        "utf8"
      ).toString("base64");
      const twitterOauthTokenParams = __spreadValues({
        grant_type: "authorization_code",
        client_id: clientId,
        code_verifier: input2.redirectURIInfo.pkceCodeVerifier,
        redirect_uri: redirectUri,
        code: input2.redirectURIInfo.redirectURIQueryParams.code
      }, originalImplementation.config.tokenEndpointBodyParams);
      const tokenResponse = await (0, import_utils.doPostRequest)(
        originalImplementation.config.tokenEndpoint,
        twitterOauthTokenParams,
        {
          Authorization: `Basic ${basicAuthToken}`
        }
      );
      if (tokenResponse.status >= 400) {
        (0, import_logger.logDebugMessage)(
          `Received response with status ${tokenResponse.status} and body ${tokenResponse.stringResponse}`
        );
        throw new Error(
          `Received response with status ${tokenResponse.status} and body ${tokenResponse.stringResponse}`
        );
      }
      return tokenResponse.jsonResponse;
    };
    if (oOverride !== void 0) {
      originalImplementation = oOverride(originalImplementation);
    }
    return originalImplementation;
  };
  return (0, import_custom.default)(input);
}
