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
var linkedin_exports = {};
__export(linkedin_exports, {
  default: () => Linkedin
});
module.exports = __toCommonJS(linkedin_exports);
var import_logger = require("../../../logger");
var import_custom = __toESM(require("./custom"), 1);
var import_utils = require("./utils");
function Linkedin(input) {
  if (input.config.name === void 0) {
    input.config.name = "LinkedIn";
  }
  if (input.config.authorizationEndpoint === void 0) {
    input.config.authorizationEndpoint = "https://www.linkedin.com/oauth/v2/authorization";
  }
  if (input.config.tokenEndpoint === void 0) {
    input.config.tokenEndpoint = "https://www.linkedin.com/oauth/v2/accessToken";
  }
  const oOverride = input.override;
  input.override = function(originalImplementation) {
    const oGetConfig = originalImplementation.getConfigForClientType;
    originalImplementation.getConfigForClientType = async function(input2) {
      const config = await oGetConfig(input2);
      if (config.scope === void 0) {
        config.scope = ["openid", "profile", "email"];
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
        "https://api.linkedin.com/v2/userinfo",
        void 0,
        headers
      );
      rawUserInfoFromProvider.fromUserInfoAPI = userInfoFromAccessToken.jsonResponse;
      if (userInfoFromAccessToken.status >= 400) {
        (0, import_logger.logDebugMessage)(
          `Received response with status ${userInfoFromAccessToken.status} and body ${userInfoFromAccessToken.stringResponse}`
        );
        throw new Error(
          `Received response with status ${userInfoFromAccessToken.status} and body ${userInfoFromAccessToken.stringResponse}`
        );
      }
      return {
        thirdPartyUserId: rawUserInfoFromProvider.fromUserInfoAPI.sub,
        email: {
          id: rawUserInfoFromProvider.fromUserInfoAPI.email,
          isVerified: rawUserInfoFromProvider.fromUserInfoAPI.email_verified
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
