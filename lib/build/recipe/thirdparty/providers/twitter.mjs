var __defProp = Object.defineProperty;
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
import { logDebugMessage } from "../../../logger";
import NewProvider, {
  DEV_OAUTH_REDIRECT_URL,
  getActualClientIdFromDevelopmentClientId,
  isUsingDevelopmentClientId
} from "./custom";
import { doPostRequest } from "./utils";
import { Buffer as Buffer2 } from "node:buffer";
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
      if (isUsingDevelopmentClientId(originalImplementation.config.clientId)) {
        clientId = getActualClientIdFromDevelopmentClientId(originalImplementation.config.clientId);
        redirectUri = DEV_OAUTH_REDIRECT_URL;
      }
      const basicAuthToken = Buffer2.from(
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
      const tokenResponse = await doPostRequest(
        originalImplementation.config.tokenEndpoint,
        twitterOauthTokenParams,
        {
          Authorization: `Basic ${basicAuthToken}`
        }
      );
      if (tokenResponse.status >= 400) {
        logDebugMessage(
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
  return NewProvider(input);
}
export {
  Twitter as default
};
