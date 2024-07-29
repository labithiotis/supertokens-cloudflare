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
var custom_exports = {};
__export(custom_exports, {
  DEV_OAUTH_REDIRECT_URL: () => DEV_OAUTH_REDIRECT_URL,
  default: () => NewProvider,
  getActualClientIdFromDevelopmentClientId: () => getActualClientIdFromDevelopmentClientId,
  isUsingDevelopmentClientId: () => isUsingDevelopmentClientId
});
module.exports = __toCommonJS(custom_exports);
var import_utils = require("./utils");
var import_pkce_challenge = __toESM(require("pkce-challenge"), 1);
var import_configUtils = require("./configUtils");
var import_jose = require("jose");
var import_logger = require("../../../logger");
const DEV_OAUTH_AUTHORIZATION_URL = "https://supertokens.io/dev/oauth/redirect-to-provider";
const DEV_OAUTH_REDIRECT_URL = "https://supertokens.io/dev/oauth/redirect-to-app";
const DEV_OAUTH_CLIENT_IDS = [
  "1060725074195-kmeum4crr01uirfl2op9kd5acmi9jutn.apps.googleusercontent.com",
  // google
  "467101b197249757c71f"
  // github
];
const DEV_KEY_IDENTIFIER = "4398792-";
function isUsingDevelopmentClientId(client_id) {
  return client_id.startsWith(DEV_KEY_IDENTIFIER) || DEV_OAUTH_CLIENT_IDS.includes(client_id);
}
function getActualClientIdFromDevelopmentClientId(client_id) {
  if (client_id.startsWith(DEV_KEY_IDENTIFIER)) {
    return client_id.split(DEV_KEY_IDENTIFIER)[1];
  }
  return client_id;
}
function accessField(obj, key) {
  const keyParts = key.split(".");
  for (const k of keyParts) {
    if (obj === void 0) {
      return void 0;
    }
    if (typeof obj !== "object") {
      return void 0;
    }
    obj = obj[k];
  }
  return obj;
}
function getSupertokensUserInfoResultFromRawUserInfo(config, rawUserInfoResponse) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
  let thirdPartyUserId = "";
  if (((_b = (_a = config.userInfoMap) == null ? void 0 : _a.fromUserInfoAPI) == null ? void 0 : _b.userId) !== void 0) {
    const userId = accessField(rawUserInfoResponse.fromUserInfoAPI, config.userInfoMap.fromUserInfoAPI.userId);
    if (userId !== void 0) {
      thirdPartyUserId = userId;
    }
  }
  if (((_d = (_c = config.userInfoMap) == null ? void 0 : _c.fromIdTokenPayload) == null ? void 0 : _d.userId) !== void 0) {
    const userId = accessField(
      rawUserInfoResponse.fromIdTokenPayload,
      config.userInfoMap.fromIdTokenPayload.userId
    );
    if (userId !== void 0) {
      thirdPartyUserId = userId;
    }
  }
  if (thirdPartyUserId === "") {
    throw new Error("third party user id is missing");
  }
  const result = {
    thirdPartyUserId
  };
  let email = "";
  if (((_f = (_e = config.userInfoMap) == null ? void 0 : _e.fromUserInfoAPI) == null ? void 0 : _f.email) !== void 0) {
    const emailVal = accessField(rawUserInfoResponse.fromUserInfoAPI, config.userInfoMap.fromUserInfoAPI.email);
    if (emailVal !== void 0) {
      email = emailVal;
    }
  }
  if (((_h = (_g = config.userInfoMap) == null ? void 0 : _g.fromIdTokenPayload) == null ? void 0 : _h.email) !== void 0) {
    const emailVal = accessField(
      rawUserInfoResponse.fromIdTokenPayload,
      config.userInfoMap.fromIdTokenPayload.email
    );
    if (emailVal !== void 0) {
      email = emailVal;
    }
  }
  if (email !== "") {
    result.email = {
      id: email,
      isVerified: false
    };
    if (((_j = (_i = config.userInfoMap) == null ? void 0 : _i.fromUserInfoAPI) == null ? void 0 : _j.emailVerified) !== void 0) {
      const emailVerifiedVal = accessField(
        rawUserInfoResponse.fromUserInfoAPI,
        config.userInfoMap.fromUserInfoAPI.emailVerified
      );
      result.email.isVerified = emailVerifiedVal === true || typeof emailVerifiedVal === "string" && emailVerifiedVal.toLowerCase() === "true";
    }
    if (((_l = (_k = config.userInfoMap) == null ? void 0 : _k.fromIdTokenPayload) == null ? void 0 : _l.emailVerified) !== void 0) {
      const emailVerifiedVal = accessField(
        rawUserInfoResponse.fromIdTokenPayload,
        config.userInfoMap.fromIdTokenPayload.emailVerified
      );
      result.email.isVerified = emailVerifiedVal === true || emailVerifiedVal === "true";
    }
  }
  return result;
}
function NewProvider(input) {
  var _a, _b;
  input.config.userInfoMap = {
    fromIdTokenPayload: __spreadValues({
      userId: "sub",
      email: "email",
      emailVerified: "email_verified"
    }, (_a = input.config.userInfoMap) == null ? void 0 : _a.fromIdTokenPayload),
    fromUserInfoAPI: __spreadValues({
      userId: "sub",
      email: "email",
      emailVerified: "email_verified"
    }, (_b = input.config.userInfoMap) == null ? void 0 : _b.fromUserInfoAPI)
  };
  if (input.config.generateFakeEmail === void 0) {
    input.config.generateFakeEmail = async function({ thirdPartyUserId }) {
      return `${thirdPartyUserId}.${input.config.thirdPartyId}@stfakeemail.supertokens.com`;
    };
  }
  let jwks;
  let impl = {
    id: input.config.thirdPartyId,
    config: __spreadProps(__spreadValues({}, input.config), {
      clientId: "temp"
    }),
    getConfigForClientType: async function({ clientType }) {
      if (clientType === void 0) {
        if (input.config.clients === void 0 || input.config.clients.length !== 1) {
          throw new Error("please provide exactly one client config or pass clientType or tenantId");
        }
        return (0, import_configUtils.getProviderConfigForClient)(input.config, input.config.clients[0]);
      }
      if (input.config.clients !== void 0) {
        for (const client of input.config.clients) {
          if (client.clientType === clientType) {
            return (0, import_configUtils.getProviderConfigForClient)(input.config, client);
          }
        }
      }
      throw new Error(`Could not find client config for clientType: ${clientType}`);
    },
    getAuthorisationRedirectURL: async function({ redirectURIOnProviderDashboard }) {
      const queryParams = {
        client_id: impl.config.clientId,
        redirect_uri: redirectURIOnProviderDashboard,
        response_type: "code"
      };
      if (impl.config.scope !== void 0) {
        queryParams.scope = impl.config.scope.join(" ");
      }
      let pkceCodeVerifier = void 0;
      if (impl.config.clientSecret === void 0 || impl.config.forcePKCE) {
        const { code_challenge, code_verifier } = (0, import_pkce_challenge.default)(64);
        queryParams["code_challenge"] = code_challenge;
        queryParams["code_challenge_method"] = "S256";
        pkceCodeVerifier = code_verifier;
      }
      if (impl.config.authorizationEndpointQueryParams !== void 0) {
        for (const [key, value] of Object.entries(impl.config.authorizationEndpointQueryParams)) {
          if (value === null) {
            delete queryParams[key];
          } else {
            queryParams[key] = value;
          }
        }
      }
      if (impl.config.authorizationEndpoint === void 0) {
        throw new Error("ThirdParty provider's authorizationEndpoint is not configured.");
      }
      let url = impl.config.authorizationEndpoint;
      if (isUsingDevelopmentClientId(impl.config.clientId)) {
        queryParams["client_id"] = getActualClientIdFromDevelopmentClientId(impl.config.clientId);
        queryParams["actual_redirect_uri"] = url;
        url = DEV_OAUTH_AUTHORIZATION_URL;
      }
      const urlObj = new URL(url);
      for (const [key, value] of Object.entries(queryParams)) {
        urlObj.searchParams.set(key, value);
      }
      return {
        urlWithQueryParams: urlObj.toString(),
        pkceCodeVerifier
      };
    },
    exchangeAuthCodeForOAuthTokens: async function({ redirectURIInfo }) {
      if (impl.config.tokenEndpoint === void 0) {
        throw new Error("ThirdParty provider's tokenEndpoint is not configured.");
      }
      const tokenAPIURL = impl.config.tokenEndpoint;
      const accessTokenAPIParams = {
        client_id: impl.config.clientId,
        redirect_uri: redirectURIInfo.redirectURIOnProviderDashboard,
        code: redirectURIInfo.redirectURIQueryParams["code"],
        grant_type: "authorization_code"
      };
      if (impl.config.clientSecret !== void 0) {
        accessTokenAPIParams["client_secret"] = impl.config.clientSecret;
      }
      if (redirectURIInfo.pkceCodeVerifier !== void 0) {
        accessTokenAPIParams["code_verifier"] = redirectURIInfo.pkceCodeVerifier;
      }
      for (const key in impl.config.tokenEndpointBodyParams) {
        if (impl.config.tokenEndpointBodyParams[key] === null) {
          delete accessTokenAPIParams[key];
        } else {
          accessTokenAPIParams[key] = impl.config.tokenEndpointBodyParams[key];
        }
      }
      if (isUsingDevelopmentClientId(impl.config.clientId)) {
        accessTokenAPIParams["client_id"] = getActualClientIdFromDevelopmentClientId(impl.config.clientId);
        accessTokenAPIParams["redirect_uri"] = DEV_OAUTH_REDIRECT_URL;
      }
      const tokenResponse = await (0, import_utils.doPostRequest)(tokenAPIURL, accessTokenAPIParams);
      if (tokenResponse.status >= 400) {
        (0, import_logger.logDebugMessage)(
          `Received response with status ${tokenResponse.status} and body ${tokenResponse.stringResponse}`
        );
        throw new Error(
          `Received response with status ${tokenResponse.status} and body ${tokenResponse.stringResponse}`
        );
      }
      return tokenResponse.jsonResponse;
    },
    getUserInfo: async function({ oAuthTokens, userContext }) {
      const accessToken = oAuthTokens["access_token"];
      const idToken = oAuthTokens["id_token"];
      let rawUserInfoFromProvider = {
        fromUserInfoAPI: {},
        fromIdTokenPayload: {}
      };
      if (idToken && impl.config.jwksURI !== void 0) {
        if (jwks === void 0) {
          jwks = (0, import_jose.createRemoteJWKSet)(new URL(impl.config.jwksURI));
        }
        rawUserInfoFromProvider.fromIdTokenPayload = await (0, import_utils.verifyIdTokenFromJWKSEndpointAndGetPayload)(
          idToken,
          jwks,
          {
            audience: getActualClientIdFromDevelopmentClientId(impl.config.clientId)
          }
        );
        if (impl.config.validateIdTokenPayload !== void 0) {
          await impl.config.validateIdTokenPayload({
            idTokenPayload: rawUserInfoFromProvider.fromIdTokenPayload,
            clientConfig: impl.config,
            userContext
          });
        }
      }
      if (impl.config.validateAccessToken !== void 0 && accessToken !== void 0) {
        await impl.config.validateAccessToken({
          accessToken,
          clientConfig: impl.config,
          userContext
        });
      }
      if (accessToken && impl.config.userInfoEndpoint !== void 0) {
        const headers = {
          Authorization: "Bearer " + accessToken
        };
        const queryParams = {};
        if (impl.config.userInfoEndpointHeaders !== void 0) {
          for (const [key, value] of Object.entries(impl.config.userInfoEndpointHeaders)) {
            if (value === null) {
              delete headers[key];
            } else {
              headers[key] = value;
            }
          }
        }
        if (impl.config.userInfoEndpointQueryParams !== void 0) {
          for (const [key, value] of Object.entries(impl.config.userInfoEndpointQueryParams)) {
            if (value === null) {
              delete queryParams[key];
            } else {
              queryParams[key] = value;
            }
          }
        }
        const userInfoFromAccessToken = await (0, import_utils.doGetRequest)(impl.config.userInfoEndpoint, queryParams, headers);
        if (userInfoFromAccessToken.status >= 400) {
          (0, import_logger.logDebugMessage)(
            `Received response with status ${userInfoFromAccessToken.status} and body ${userInfoFromAccessToken.stringResponse}`
          );
          throw new Error(
            `Received response with status ${userInfoFromAccessToken.status} and body ${userInfoFromAccessToken.stringResponse}`
          );
        }
        rawUserInfoFromProvider.fromUserInfoAPI = userInfoFromAccessToken.jsonResponse;
      }
      const userInfoResult = getSupertokensUserInfoResultFromRawUserInfo(impl.config, rawUserInfoFromProvider);
      return {
        thirdPartyUserId: userInfoResult.thirdPartyUserId,
        email: userInfoResult.email,
        rawUserInfoFromProvider
      };
    }
  };
  if (input.override !== void 0) {
    impl = input.override(impl);
  }
  return impl;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEV_OAUTH_REDIRECT_URL,
  getActualClientIdFromDevelopmentClientId,
  isUsingDevelopmentClientId
});
