"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var utils_exports = {};
__export(utils_exports, {
  isFakeEmail: () => isFakeEmail,
  validateAndNormaliseUserInput: () => validateAndNormaliseUserInput
});
module.exports = __toCommonJS(utils_exports);
function validateAndNormaliseUserInput(appInfo, config) {
  let signInAndUpFeature = validateAndNormaliseSignInAndUpConfig(appInfo, config == null ? void 0 : config.signInAndUpFeature);
  let override = __spreadValues({
    functions: (originalImplementation) => originalImplementation,
    apis: (originalImplementation) => originalImplementation
  }, config == null ? void 0 : config.override);
  return {
    signInAndUpFeature,
    override
  };
}
function validateAndNormaliseSignInAndUpConfig(_, config) {
  if (config === void 0 || config.providers === void 0) {
    return {
      providers: []
    };
  }
  const thirdPartyIdSet = /* @__PURE__ */ new Set();
  for (const provider of config.providers) {
    if (thirdPartyIdSet.has(provider.config.thirdPartyId)) {
      throw new Error(`The providers array has multiple entries for the same third party provider.`);
    }
    thirdPartyIdSet.add(provider.config.thirdPartyId);
  }
  return {
    providers: config.providers
  };
}
function isFakeEmail(email) {
  return email.endsWith("@stfakeemail.supertokens.com") || email.endsWith(".fakeemail.com");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isFakeEmail,
  validateAndNormaliseUserInput
});
