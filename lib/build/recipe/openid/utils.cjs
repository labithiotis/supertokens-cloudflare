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
var utils_exports = {};
__export(utils_exports, {
  validateAndNormaliseUserInput: () => validateAndNormaliseUserInput
});
module.exports = __toCommonJS(utils_exports);
var import_normalisedURLDomain = __toESM(require("../../normalisedURLDomain"), 1);
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
function validateAndNormaliseUserInput(appInfo, config) {
  let issuerDomain = appInfo.apiDomain;
  let issuerPath = appInfo.apiBasePath;
  if (config !== void 0) {
    if (config.issuer !== void 0) {
      issuerDomain = new import_normalisedURLDomain.default(config.issuer);
      issuerPath = new import_normalisedURLPath.default(config.issuer);
    }
    if (!issuerPath.equals(appInfo.apiBasePath)) {
      throw new Error("The path of the issuer URL must be equal to the apiBasePath. The default value is /auth");
    }
  }
  let override = __spreadValues({
    functions: (originalImplementation) => originalImplementation,
    apis: (originalImplementation) => originalImplementation
  }, config == null ? void 0 : config.override);
  return {
    issuerDomain,
    issuerPath,
    jwtValiditySeconds: config == null ? void 0 : config.jwtValiditySeconds,
    override
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  validateAndNormaliseUserInput
});
