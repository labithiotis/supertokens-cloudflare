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
import NewProvider from "./custom";
import { doGetRequest, doPostRequest } from "./utils";
import { Buffer as Buffer2 } from "node:buffer";
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
      const basicAuthToken = Buffer2.from(
        `${clientConfig.clientId}:${clientConfig.clientSecret === void 0 ? "" : clientConfig.clientSecret}`
      ).toString("base64");
      const applicationResponse = await doPostRequest(
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
      const emailInfoResp = await doGetRequest("https://api.github.com/user/emails", void 0, headers);
      if (emailInfoResp.status >= 400) {
        throw new Error(
          `Getting userInfo failed with ${emailInfoResp.status}: ${emailInfoResp.stringResponse}`
        );
      }
      rawResponse.emails = emailInfoResp.jsonResponse;
      const userInfoResp = await doGetRequest("https://api.github.com/user", void 0, headers);
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
  return NewProvider(input);
}
export {
  Github as default
};
