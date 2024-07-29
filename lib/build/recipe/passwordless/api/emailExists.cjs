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
var emailExists_exports = {};
__export(emailExists_exports, {
  default: () => emailExists
});
module.exports = __toCommonJS(emailExists_exports);
var import_utils = require("../../../utils");
var import_error = __toESM(require("../error"), 1);
async function emailExists(apiImplementation, tenantId, options, userContext) {
  if (apiImplementation.emailExistsGET === void 0) {
    return false;
  }
  let email = options.req.getKeyValueFromQuery("email");
  if (email === void 0 || typeof email !== "string") {
    throw new import_error.default({
      type: import_error.default.BAD_INPUT_ERROR,
      message: "Please provide the email as a GET param"
    });
  }
  let result = await apiImplementation.emailExistsGET({
    email,
    tenantId,
    options,
    userContext
  });
  (0, import_utils.send200Response)(options.res, result);
  return true;
}