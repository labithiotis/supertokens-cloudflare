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
var import_constants = require("../jwt/constants");
function getRecipeInterface(config, jwtRecipeImplementation) {
  return {
    getOpenIdDiscoveryConfiguration: async function() {
      let issuer = config.issuerDomain.getAsStringDangerous() + config.issuerPath.getAsStringDangerous();
      let jwks_uri = config.issuerDomain.getAsStringDangerous() + config.issuerPath.appendPath(new import_normalisedURLPath.default(import_constants.GET_JWKS_API)).getAsStringDangerous();
      return {
        status: "OK",
        issuer,
        jwks_uri
      };
    },
    createJWT: async function({
      payload,
      validitySeconds,
      useStaticSigningKey,
      userContext
    }) {
      payload = payload === void 0 || payload === null ? {} : payload;
      let issuer = config.issuerDomain.getAsStringDangerous() + config.issuerPath.getAsStringDangerous();
      return await jwtRecipeImplementation.createJWT({
        payload: __spreadValues({
          iss: issuer
        }, payload),
        useStaticSigningKey,
        validitySeconds,
        userContext
      });
    },
    getJWKS: async function(input) {
      return await jwtRecipeImplementation.getJWKS(input);
    }
  };
}
