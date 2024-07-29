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
  var _a, _b, _c;
  let override = __spreadValues({
    functions: (originalImplementation) => originalImplementation,
    apis: (originalImplementation) => originalImplementation
  }, config == null ? void 0 : config.override);
  return {
    issuer: (_a = config == null ? void 0 : config.issuer) != null ? _a : appInfo.appName,
    defaultSkew: (_b = config == null ? void 0 : config.defaultSkew) != null ? _b : 1,
    defaultPeriod: (_c = config == null ? void 0 : config.defaultPeriod) != null ? _c : 30,
    override
  };
}
export {
  validateAndNormaliseUserInput
};
