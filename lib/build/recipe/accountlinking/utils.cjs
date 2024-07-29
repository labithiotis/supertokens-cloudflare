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
  recipeInitDefinedShouldDoAutomaticAccountLinking: () => recipeInitDefinedShouldDoAutomaticAccountLinking,
  validateAndNormaliseUserInput: () => validateAndNormaliseUserInput
});
module.exports = __toCommonJS(utils_exports);
async function defaultOnAccountLinked() {
}
async function defaultShouldDoAutomaticAccountLinking() {
  return {
    shouldAutomaticallyLink: false
  };
}
function recipeInitDefinedShouldDoAutomaticAccountLinking(config) {
  return config.shouldDoAutomaticAccountLinking !== defaultShouldDoAutomaticAccountLinking;
}
function validateAndNormaliseUserInput(_, config) {
  let onAccountLinked = (config == null ? void 0 : config.onAccountLinked) || defaultOnAccountLinked;
  let shouldDoAutomaticAccountLinking = (config == null ? void 0 : config.shouldDoAutomaticAccountLinking) || defaultShouldDoAutomaticAccountLinking;
  let override = __spreadValues({
    functions: (originalImplementation) => originalImplementation
  }, config == null ? void 0 : config.override);
  return {
    override,
    onAccountLinked,
    shouldDoAutomaticAccountLinking
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  recipeInitDefinedShouldDoAutomaticAccountLinking,
  validateAndNormaliseUserInput
});