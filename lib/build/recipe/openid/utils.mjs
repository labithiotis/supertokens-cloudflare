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
import NormalisedURLDomain from "../../normalisedURLDomain";
import NormalisedURLPath from "../../normalisedURLPath";
function validateAndNormaliseUserInput(appInfo, config) {
  let issuerDomain = appInfo.apiDomain;
  let issuerPath = appInfo.apiBasePath;
  if (config !== void 0) {
    if (config.issuer !== void 0) {
      issuerDomain = new NormalisedURLDomain(config.issuer);
      issuerPath = new NormalisedURLPath(config.issuer);
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
export {
  validateAndNormaliseUserInput
};
