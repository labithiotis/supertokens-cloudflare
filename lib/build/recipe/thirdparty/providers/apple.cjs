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
var apple_exports = {};
__export(apple_exports, {
  default: () => Apple
});
module.exports = __toCommonJS(apple_exports);
var import_custom = __toESM(require("./custom"), 1);
var jose = __toESM(require("jose"), 1);
var import_utils = require("./utils");
async function getClientSecret(clientId, keyId, teamId, privateKey) {
  const alg = "ES256";
  const key = await jose.importPKCS8(privateKey.replace(/\\n/g, "\n"), alg);
  return new jose.SignJWT({}).setProtectedHeader({ alg, kid: keyId, typ: "JWT" }).setIssuer(teamId).setIssuedAt().setExpirationTime("180days").setAudience("https://appleid.apple.com").setSubject((0, import_custom.getActualClientIdFromDevelopmentClientId)(clientId)).sign(key);
}
function Apple(input) {
  if (input.config.name === void 0) {
    input.config.name = "Apple";
  }
  if (input.config.oidcDiscoveryEndpoint === void 0) {
    input.config.oidcDiscoveryEndpoint = "https://appleid.apple.com/.well-known/openid-configuration";
  }
  input.config.authorizationEndpointQueryParams = __spreadValues({
    response_mode: "form_post"
  }, input.config.authorizationEndpointQueryParams);
  const oOverride = input.override;
  input.override = function(originalImplementation) {
    const oGetConfig = originalImplementation.getConfigForClientType;
    originalImplementation.getConfigForClientType = async function({ clientType, userContext }) {
      const config = await oGetConfig({ clientType, userContext });
      if (config.scope === void 0) {
        config.scope = ["openid", "email"];
      }
      if (config.clientSecret === void 0) {
        if (config.additionalConfig === void 0 || config.additionalConfig.keyId === void 0 || config.additionalConfig.teamId === void 0 || config.additionalConfig.privateKey === void 0) {
          throw new Error(
            "Please ensure that keyId, teamId and privateKey are provided in the additionalConfig"
          );
        }
        config.clientSecret = await getClientSecret(
          config.clientId,
          config.additionalConfig.keyId,
          config.additionalConfig.teamId,
          config.additionalConfig.privateKey
        );
      }
      config.oidcDiscoveryEndpoint = (0, import_utils.normaliseOIDCEndpointToIncludeWellKnown)(config.oidcDiscoveryEndpoint);
      return config;
    };
    const oExchangeAuthCodeForOAuthTokens = originalImplementation.exchangeAuthCodeForOAuthTokens;
    originalImplementation.exchangeAuthCodeForOAuthTokens = async function(input2) {
      const response = await oExchangeAuthCodeForOAuthTokens(input2);
      const user = input2.redirectURIInfo.redirectURIQueryParams.user;
      if (user !== void 0) {
        if (typeof user === "string") {
          response.user = JSON.parse(user);
        } else if (typeof user === "object") {
          response.user = user;
        }
      }
      return response;
    };
    const oGetUserInfo = originalImplementation.getUserInfo;
    originalImplementation.getUserInfo = async function(input2) {
      var _a, _b;
      const response = await oGetUserInfo(input2);
      const user = input2.oAuthTokens.user;
      if (user !== void 0) {
        if (typeof user === "string") {
          response.rawUserInfoFromProvider = __spreadProps(__spreadValues({}, response.rawUserInfoFromProvider), {
            fromIdTokenPayload: __spreadProps(__spreadValues({}, (_a = response.rawUserInfoFromProvider) == null ? void 0 : _a.fromIdTokenPayload), {
              user: JSON.parse(user)
            })
          });
        } else if (typeof user === "object") {
          response.rawUserInfoFromProvider = __spreadProps(__spreadValues({}, response.rawUserInfoFromProvider), {
            fromIdTokenPayload: __spreadProps(__spreadValues({}, (_b = response.rawUserInfoFromProvider) == null ? void 0 : _b.fromIdTokenPayload), {
              user
            })
          });
        }
      }
      return response;
    };
    if (oOverride !== void 0) {
      originalImplementation = oOverride(originalImplementation);
    }
    return originalImplementation;
  };
  return (0, import_custom.default)(input);
}
