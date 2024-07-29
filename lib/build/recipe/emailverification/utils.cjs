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
var utils_exports = {};
__export(utils_exports, {
  getEmailVerifyLink: () => getEmailVerifyLink,
  validateAndNormaliseUserInput: () => validateAndNormaliseUserInput
});
module.exports = __toCommonJS(utils_exports);
var import_backwardCompatibility = __toESM(require("./emaildelivery/services/backwardCompatibility"), 1);
function validateAndNormaliseUserInput(_, appInfo, config) {
  let override = __spreadValues({
    functions: (originalImplementation) => originalImplementation,
    apis: (originalImplementation) => originalImplementation
  }, config.override);
  function getEmailDeliveryConfig(isInServerlessEnv) {
    var _a;
    let emailService = (_a = config.emailDelivery) == null ? void 0 : _a.service;
    if (emailService === void 0) {
      emailService = new import_backwardCompatibility.default(appInfo, isInServerlessEnv);
    }
    return __spreadProps(__spreadValues({}, config.emailDelivery), {
      /**
       * if we do
       * let emailDelivery = {
       *    service: emailService,
       *    ...config.emailDelivery,
       * };
       *
       * and if the user has passed service as undefined,
       * it it again get set to undefined, so we
       * set service at the end
       */
      service: emailService
    });
  }
  return {
    mode: config.mode,
    getEmailForRecipeUserId: config.getEmailForRecipeUserId,
    override,
    getEmailDeliveryConfig
  };
}
function getEmailVerifyLink(input) {
  return input.appInfo.getOrigin({
    request: input.request,
    userContext: input.userContext
  }).getAsStringDangerous() + input.appInfo.websiteBasePath.getAsStringDangerous() + "/verify-email?token=" + input.token + "&tenantId=" + input.tenantId;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getEmailVerifyLink,
  validateAndNormaliseUserInput
});
