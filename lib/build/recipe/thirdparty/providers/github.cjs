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
var github_exports = {};
__export(github_exports, {
  default: () => Github
});
module.exports = __toCommonJS(github_exports);
var import_custom = __toESM(require("./custom"), 1);
var import_utils = require("./utils");
var import_node_buffer = require("node:buffer");
function getSupertokensUserInfoFromRawUserInfoResponseForGithub(rawUserInfoResponse) {
  if (rawUserInfoResponse.fromUserInfoAPI === void 0) {
    throw new Error("rawUserInfoResponse.fromUserInfoAPI is not available");
  }
  const result = {
    thirdPartyUserId: `${rawUserInfoResponse.fromUserInfoAPI.user.id}`,
    // coz user.id is a number
    rawUserInfoFromProvider: {
      fromIdTokenPayload: {},
      fromUserInfoAPI: {}
    }
  };
  const emailsInfo = rawUserInfoResponse.fromUserInfoAPI.emails;
  for (const info of emailsInfo) {
    if (info.primary) {
      result.email = {
        id: info.email,
        isVerified: info.verified
      };
    }
  }
  return result;
}
function Github(input) {
  if (input.config.name === void 0) {
    input.config.name = "Github";
  }
  if (input.config.authorizationEndpoint === void 0) {
    input.config.authorizationEndpoint = "https://github.com/login/oauth/authorize";
  }
  if (input.config.tokenEndpoint === void 0) {
    input.config.tokenEndpoint = "https://github.com/login/oauth/access_token";
  }
  if (input.config.validateAccessToken === void 0) {
    input.config.validateAccessToken = async ({ accessToken, clientConfig }) => {
      const basicAuthToken = import_node_buffer.Buffer.from(
        `${clientConfig.clientId}:${clientConfig.clientSecret === void 0 ? "" : clientConfig.clientSecret}`
      ).toString("base64");
      const applicationResponse = await (0, import_utils.doPostRequest)(
        `https://api.github.com/applications/${clientConfig.clientId}/token`,
        {
          access_token: accessToken
        },
        {
          Authorization: `Basic ${basicAuthToken}`,
          "Content-Type": "application/json"
        }
      );
      if (applicationResponse.status !== 200) {
        throw new Error("Invalid access token");
      }
      if (applicationResponse.jsonResponse.app === void 0 || applicationResponse.jsonResponse.app.client_id !== clientConfig.clientId) {
        throw new Error("Access token does not belong to your application");
      }
    };
  }
  const oOverride = input.override;
  input.override = function(originalImplementation) {
    const oGetConfig = originalImplementation.getConfigForClientType;
    originalImplementation.getConfigForClientType = async function(input2) {
      const config = await oGetConfig(input2);
      if (config.scope === void 0) {
        config.scope = ["read:user", "user:email"];
      }
      return config;
    };
    originalImplementation.getUserInfo = async function(input2) {
      const headers = {
        Authorization: `Bearer ${input2.oAuthTokens.access_token}`,
        Accept: "application/vnd.github.v3+json"
      };
      const rawResponse = {};
      const emailInfoResp = await (0, import_utils.doGetRequest)("https://api.github.com/user/emails", void 0, headers);
      if (emailInfoResp.status >= 400) {
        throw new Error(
          `Getting userInfo failed with ${emailInfoResp.status}: ${emailInfoResp.stringResponse}`
        );
      }
      rawResponse.emails = emailInfoResp.jsonResponse;
      const userInfoResp = await (0, import_utils.doGetRequest)("https://api.github.com/user", void 0, headers);
      if (userInfoResp.status >= 400) {
        throw new Error(`Getting userInfo failed with ${userInfoResp.status}: ${userInfoResp.stringResponse}`);
      }
      rawResponse.user = userInfoResp.jsonResponse;
      const rawUserInfoFromProvider = {
        fromUserInfoAPI: rawResponse,
        fromIdTokenPayload: {}
      };
      const userInfoResult = getSupertokensUserInfoFromRawUserInfoResponseForGithub(rawUserInfoFromProvider);
      return __spreadProps(__spreadValues({}, userInfoResult), {
        rawUserInfoFromProvider
      });
    };
    if (oOverride !== void 0) {
      originalImplementation = oOverride(originalImplementation);
    }
    return originalImplementation;
  };
  return (0, import_custom.default)(input);
}
