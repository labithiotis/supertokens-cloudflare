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
var phoneNumberExists_exports = {};
__export(phoneNumberExists_exports, {
  default: () => phoneNumberExists
});
module.exports = __toCommonJS(phoneNumberExists_exports);
var import_utils = require("../../../utils");
var import_error = __toESM(require("../error"), 1);
async function phoneNumberExists(apiImplementation, tenantId, options, userContext) {
  if (apiImplementation.phoneNumberExistsGET === void 0) {
    return false;
  }
  let phoneNumber = options.req.getKeyValueFromQuery("phoneNumber");
  if (phoneNumber === void 0 || typeof phoneNumber !== "string") {
    throw new import_error.default({
      type: import_error.default.BAD_INPUT_ERROR,
      message: "Please provide the phoneNumber as a GET param"
    });
  }
  let result = await apiImplementation.phoneNumberExistsGET({
    phoneNumber,
    tenantId,
    options,
    userContext
  });
  (0, import_utils.send200Response)(options.res, result);
  return true;
}
