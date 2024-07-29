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
var apiKeyProtector_exports = {};
__export(apiKeyProtector_exports, {
  default: () => apiKeyProtector
});
module.exports = __toCommonJS(apiKeyProtector_exports);
var import_error = __toESM(require("../error"), 1);
var import_utils = require("../utils");
async function apiKeyProtector(apiImplementation, tenantId, options, apiFunction, userContext) {
  let shouldAllowAccess = false;
  try {
    shouldAllowAccess = await options.recipeImplementation.shouldAllowAccess({
      req: options.req,
      config: options.config,
      userContext
    });
  } catch (e) {
    if (import_error.default.isErrorFromSuperTokens(e) && e.type === import_error.default.OPERATION_NOT_ALLOWED) {
      options.res.setStatusCode(403);
      options.res.sendJSONResponse({
        message: e.message
      });
      return true;
    }
    throw e;
  }
  if (!shouldAllowAccess) {
    (0, import_utils.sendUnauthorisedAccess)(options.res);
    return true;
  }
  const response = await apiFunction(apiImplementation, tenantId, options, userContext);
  options.res.sendJSONResponse(response);
  return true;
}
