"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var bitbucket_exports = {};
__export(bitbucket_exports, {
  default: () => Bitbucket
});
module.exports = __toCommonJS(bitbucket_exports);
var import_utils = require("./utils");
var import_custom = __toESM(require("./custom"), 1);
var import_logger = require("../../../logger");
function Bitbucket(input) {
  if (input.config.name === void 0) {
    input.config.name = "Bitbucket";
  }
  if (input.config.authorizationEndpoint === void 0) {
    input.config.authorizationEndpoint = "https://bitbucket.org/site/oauth2/authorize";
  }
  if (input.config.tokenEndpoint === void 0) {
    input.config.tokenEndpoint = "https://bitbucket.org/site/oauth2/access_token";
  }
  if (input.config.authorizationEndpointQueryParams === void 0) {
    input.config.authorizationEndpointQueryParams = {
      audience: "api.atlassian.com"
    };
  }
  const oOverride = input.override;
  input.override = function(originalImplementation) {
    const oGetConfig = originalImplementation.getConfigForClientType;
    originalImplementation.getConfigForClientType = async function(input2) {
      const config = await oGetConfig(input2);
      if (config.scope === void 0) {
        config.scope = ["account", "email"];
      }
      return config;
    };
    originalImplementation.getUserInfo = async function(input2) {
      const accessToken = input2.oAuthTokens.access_token;
      if (accessToken === void 0) {
        throw new Error("Access token not found");
      }
      const headers = {
        Authorization: `Bearer ${accessToken}`
      };
      let rawUserInfoFromProvider = {
        fromUserInfoAPI: {},
        fromIdTokenPayload: {}
      };
      const userInfoFromAccessToken = await (0, import_utils.doGetRequest)(
        "https://api.bitbucket.org/2.0/user",
        void 0,
        headers
      );
      if (userInfoFromAccessToken.status >= 400) {
        (0, import_logger.logDebugMessage)(
          `Received response with status ${userInfoFromAccessToken.status} and body ${userInfoFromAccessToken.stringResponse}`
        );
        throw new Error(
          `Received response with status ${userInfoFromAccessToken.status} and body ${userInfoFromAccessToken.stringResponse}`
        );
      }
      rawUserInfoFromProvider.fromUserInfoAPI = userInfoFromAccessToken.jsonResponse;
      const userInfoFromEmail = await (0, import_utils.doGetRequest)(
        "https://api.bitbucket.org/2.0/user/emails",
        void 0,
        headers
      );
      if (userInfoFromEmail.status >= 400) {
        (0, import_logger.logDebugMessage)(
          `Received response with status ${userInfoFromEmail.status} and body ${userInfoFromEmail.stringResponse}`
        );
        throw new Error(
          `Received response with status ${userInfoFromEmail.status} and body ${userInfoFromEmail.stringResponse}`
        );
      }
      rawUserInfoFromProvider.fromUserInfoAPI.email = userInfoFromEmail.jsonResponse;
      let email = void 0;
      let isVerified = false;
      for (const emailInfo of userInfoFromEmail.jsonResponse.values) {
        if (emailInfo.is_primary) {
          email = emailInfo.email;
          isVerified = emailInfo.is_confirmed;
        }
      }
      return {
        thirdPartyUserId: rawUserInfoFromProvider.fromUserInfoAPI.uuid,
        email: email === void 0 ? void 0 : {
          id: email,
          isVerified
        },
        rawUserInfoFromProvider
      };
    };
    if (oOverride !== void 0) {
      originalImplementation = oOverride(originalImplementation);
    }
    return originalImplementation;
  };
  return (0, import_custom.default)(input);
}
