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
import NewProvider from "./custom";
import { normaliseOIDCEndpointToIncludeWellKnown } from "./utils";
function Google(input) {
  if (input.config.name === void 0) {
    input.config.name = "Google";
  }
  if (input.config.oidcDiscoveryEndpoint === void 0) {
    input.config.oidcDiscoveryEndpoint = "https://accounts.google.com/.well-known/openid-configuration";
  }
  input.config.authorizationEndpointQueryParams = __spreadValues({
    included_grant_scopes: "true",
    access_type: "offline"
  }, input.config.authorizationEndpointQueryParams);
  const oOverride = input.override;
  input.override = function(originalImplementation) {
    const oGetConfig = originalImplementation.getConfigForClientType;
    originalImplementation.getConfigForClientType = async function(input2) {
      const config = await oGetConfig(input2);
      if (config.scope === void 0) {
        config.scope = ["openid", "email"];
      }
      config.oidcDiscoveryEndpoint = normaliseOIDCEndpointToIncludeWellKnown(config.oidcDiscoveryEndpoint);
      return config;
    };
    if (oOverride !== void 0) {
      originalImplementation = oOverride(originalImplementation);
    }
    return originalImplementation;
  };
  return NewProvider(input);
}
export {
  Google as default
};
