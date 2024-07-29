"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var getOpenIdDiscoveryConfiguration_exports = {};
__export(getOpenIdDiscoveryConfiguration_exports, {
  default: () => getOpenIdDiscoveryConfiguration
});
module.exports = __toCommonJS(getOpenIdDiscoveryConfiguration_exports);
var import_utils = require("../../../utils");
async function getOpenIdDiscoveryConfiguration(apiImplementation, options, userContext) {
  if (apiImplementation.getOpenIdDiscoveryConfigurationGET === void 0) {
    return false;
  }
  let result = await apiImplementation.getOpenIdDiscoveryConfigurationGET({
    options,
    userContext
  });
  if (result.status === "OK") {
    options.res.setHeader("Access-Control-Allow-Origin", "*", false);
    (0, import_utils.send200Response)(options.res, {
      issuer: result.issuer,
      jwks_uri: result.jwks_uri
    });
  } else {
    (0, import_utils.send200Response)(options.res, result);
  }
  return true;
}
