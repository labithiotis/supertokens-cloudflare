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
var authorisationUrl_exports = {};
__export(authorisationUrl_exports, {
  default: () => authorisationUrlAPI
});
module.exports = __toCommonJS(authorisationUrl_exports);
var import_utils = require("../../../utils");
var import_error = __toESM(require("../error"), 1);
async function authorisationUrlAPI(apiImplementation, tenantId, options, userContext) {
  if (apiImplementation.authorisationUrlGET === void 0) {
    return false;
  }
  const thirdPartyId = options.req.getKeyValueFromQuery("thirdPartyId");
  const redirectURIOnProviderDashboard = options.req.getKeyValueFromQuery("redirectURIOnProviderDashboard");
  const clientType = options.req.getKeyValueFromQuery("clientType");
  if (thirdPartyId === void 0 || typeof thirdPartyId !== "string") {
    throw new import_error.default({
      type: import_error.default.BAD_INPUT_ERROR,
      message: "Please provide the thirdPartyId as a GET param"
    });
  }
  if (redirectURIOnProviderDashboard === void 0 || typeof redirectURIOnProviderDashboard !== "string") {
    throw new import_error.default({
      type: import_error.default.BAD_INPUT_ERROR,
      message: "Please provide the redirectURIOnProviderDashboard as a GET param"
    });
  }
  const providerResponse = await options.recipeImplementation.getProvider({
    thirdPartyId,
    clientType,
    tenantId,
    userContext
  });
  if (providerResponse === void 0) {
    throw new import_error.default({
      type: import_error.default.BAD_INPUT_ERROR,
      message: `the provider ${thirdPartyId} could not be found in the configuration`
    });
  }
  const provider = providerResponse;
  let result = await apiImplementation.authorisationUrlGET({
    provider,
    redirectURIOnProviderDashboard,
    tenantId,
    options,
    userContext
  });
  (0, import_utils.send200Response)(options.res, result);
  return true;
}
