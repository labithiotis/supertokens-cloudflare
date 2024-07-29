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
var recipeImplementation_exports = {};
__export(recipeImplementation_exports, {
  default: () => getRecipeInterface
});
module.exports = __toCommonJS(recipeImplementation_exports);
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
const defaultJWKSMaxAge = 60;
function getRecipeInterface(querier, config, appInfo) {
  return {
    createJWT: async function({
      payload,
      validitySeconds,
      useStaticSigningKey,
      userContext
    }) {
      if (validitySeconds === void 0) {
        validitySeconds = config.jwtValiditySeconds;
      }
      let response = await querier.sendPostRequest(
        new import_normalisedURLPath.default("/recipe/jwt"),
        {
          payload: payload != null ? payload : {},
          validity: validitySeconds,
          useStaticSigningKey: useStaticSigningKey !== false,
          algorithm: "RS256",
          jwksDomain: appInfo.apiDomain.getAsStringDangerous()
        },
        userContext
      );
      if (response.status === "OK") {
        return {
          status: "OK",
          jwt: response.jwt
        };
      } else {
        return {
          status: "UNSUPPORTED_ALGORITHM_ERROR"
        };
      }
    },
    getJWKS: async function({ userContext }) {
      const { body, headers } = await querier.sendGetRequestWithResponseHeaders(
        new import_normalisedURLPath.default("/.well-known/jwks.json"),
        {},
        userContext
      );
      let validityInSeconds = defaultJWKSMaxAge;
      const cacheControl = headers.get("Cache-Control");
      if (cacheControl) {
        const maxAgeHeader = cacheControl.match(/,?\s*max-age=(\d+)(?:,|$)/);
        if (maxAgeHeader !== null) {
          validityInSeconds = Number.parseInt(maxAgeHeader[1]);
          if (!Number.isSafeInteger(validityInSeconds)) {
            validityInSeconds = defaultJWKSMaxAge;
          }
        }
      }
      return __spreadValues({
        validityInSeconds
      }, body);
    }
  };
}
