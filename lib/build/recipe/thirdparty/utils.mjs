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
export {
  isFakeEmail,
  validateAndNormaliseUserInput
};
