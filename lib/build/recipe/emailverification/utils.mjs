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
import BackwardCompatibilityService from "./emaildelivery/services/backwardCompatibility";
function validateAndNormaliseUserInput(_, appInfo, config) {
  let override = __spreadValues({
    functions: (originalImplementation) => originalImplementation,
    apis: (originalImplementation) => originalImplementation
  }, config.override);
  function getEmailDeliveryConfig(isInServerlessEnv) {
    var _a;
    let emailService = (_a = config.emailDelivery) == null ? void 0 : _a.service;
    if (emailService === void 0) {
      emailService = new BackwardCompatibilityService(appInfo, isInServerlessEnv);
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
export {
  getEmailVerifyLink,
  validateAndNormaliseUserInput
};
