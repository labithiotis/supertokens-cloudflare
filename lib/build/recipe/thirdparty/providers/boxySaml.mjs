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
import NewProvider from "./custom";
function BoxySAML(input) {
  var _a;
  if (input.config.name === void 0) {
    input.config.name = "SAML";
  }
  input.config.userInfoMap = __spreadProps(__spreadValues({}, input.config.userInfoMap), {
    fromUserInfoAPI: __spreadValues({
      userId: "id",
      email: "email"
    }, (_a = input.config.userInfoMap) == null ? void 0 : _a.fromUserInfoAPI)
  });
  const oOverride = input.override;
  input.override = function(originalImplementation) {
    const oGetConfig = originalImplementation.getConfigForClientType;
    originalImplementation.getConfigForClientType = async function({ clientType, userContext }) {
      var _a2;
      const config = await oGetConfig({ clientType, userContext });
      if (((_a2 = config.additionalConfig) == null ? void 0 : _a2.boxyURL) !== void 0) {
        const boxyURL = config.additionalConfig.boxyURL;
        if (config.authorizationEndpoint === void 0) {
          config.authorizationEndpoint = `${boxyURL}/api/oauth/authorize`;
        }
        if (config.tokenEndpoint === void 0) {
          config.tokenEndpoint = `${boxyURL}/api/oauth/token`;
        }
        if (config.userInfoEndpoint === void 0) {
          config.userInfoEndpoint = `${boxyURL}/api/oauth/userinfo`;
        }
      }
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
  BoxySAML as default
};
