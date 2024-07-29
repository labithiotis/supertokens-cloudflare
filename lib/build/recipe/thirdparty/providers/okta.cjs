"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var okta_exports = {};
__export(okta_exports, {
  default: () => Okta
});
module.exports = __toCommonJS(okta_exports);
var import_normalisedURLDomain = __toESM(require("../../../normalisedURLDomain"), 1);
var import_normalisedURLPath = __toESM(require("../../../normalisedURLPath"), 1);
var import_custom = __toESM(require("./custom"), 1);
var import_utils = require("./utils");
function Okta(input) {
  if (input.config.name === void 0) {
    input.config.name = "Okta";
  }
  const oOverride = input.override;
  input.override = function(originalImplementation) {
    const oGetConfig = originalImplementation.getConfigForClientType;
    originalImplementation.getConfigForClientType = async function(input2) {
      const config = await oGetConfig(input2);
      if (config.additionalConfig == void 0 || config.additionalConfig.oktaDomain == void 0) {
        if (config.oidcDiscoveryEndpoint === void 0) {
          throw new Error("Please provide the oktaDomain in the additionalConfig of the Okta provider.");
        }
      } else {
        const oidcDomain = new import_normalisedURLDomain.default(config.additionalConfig.oktaDomain);
        const oidcPath = new import_normalisedURLPath.default("/.well-known/openid-configuration");
        config.oidcDiscoveryEndpoint = oidcDomain.getAsStringDangerous() + oidcPath.getAsStringDangerous();
      }
      config.oidcDiscoveryEndpoint = (0, import_utils.normaliseOIDCEndpointToIncludeWellKnown)(config.oidcDiscoveryEndpoint);
      if (config.scope === void 0) {
        config.scope = ["openid", "email"];
      }
      return config;
    };
    if (oOverride !== void 0) {
      originalImplementation = oOverride(originalImplementation);
    }
    return originalImplementation;
  };
  return (0, import_custom.default)(input);
}
