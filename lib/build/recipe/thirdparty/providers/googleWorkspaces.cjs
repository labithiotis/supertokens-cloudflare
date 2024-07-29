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
var googleWorkspaces_exports = {};
__export(googleWorkspaces_exports, {
  default: () => GoogleWorkspaces
});
module.exports = __toCommonJS(googleWorkspaces_exports);
var import_google = __toESM(require("./google"), 1);
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
  return (0, import_google.default)(input);
}
