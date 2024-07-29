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
import Google from "./google";
function GoogleWorkspaces(input) {
  if (input.config.name === void 0) {
    input.config.name = "Google Workspaces";
  }
  if (input.config.validateIdTokenPayload === void 0) {
    input.config.validateIdTokenPayload = async function(input2) {
      var _a, _b, _c;
      if (((_a = input2.clientConfig.additionalConfig) == null ? void 0 : _a.hd) !== void 0 && ((_b = input2.clientConfig.additionalConfig) == null ? void 0 : _b.hd) !== "*") {
        if (((_c = input2.clientConfig.additionalConfig) == null ? void 0 : _c.hd) !== input2.idTokenPayload.hd) {
          throw new Error(
            "the value for hd claim in the id token does not match the value provided in the config"
          );
        }
      }
    };
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
      config.additionalConfig = __spreadValues({
        hd: "*"
      }, config.additionalConfig);
      config.authorizationEndpointQueryParams = __spreadProps(__spreadValues({}, config.authorizationEndpointQueryParams), {
        hd: config.additionalConfig.hd
      });
      return config;
    };
    if (oOverride !== void 0) {
      originalImplementation = oOverride(originalImplementation);
    }
    return originalImplementation;
  };
  return Google(input);
}
export {
  GoogleWorkspaces as default
};
