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
var verifyTOTP_exports = {};
__export(verifyTOTP_exports, {
  default: () => verifyTOTPAPI
});
module.exports = __toCommonJS(verifyTOTP_exports);
var import_utils = require("../../../utils");
var import_session = __toESM(require("../../session"), 1);
async function verifyTOTPAPI(apiImplementation, options, userContext) {
  if (apiImplementation.verifyTOTPPOST === void 0) {
    return false;
  }
  const session = await import_session.default.getSession(
    options.req,
    options.res,
    { overrideGlobalClaimValidators: () => [], sessionRequired: true },
    userContext
  );
  const bodyParams = await options.req.getJSONBody();
  const totp = bodyParams.totp;
  if (totp === void 0 || typeof totp !== "string") {
    throw new Error("totp is required and must be a string");
  }
  let response = await apiImplementation.verifyTOTPPOST({
    totp,
    options,
    session,
    userContext
  });
  (0, import_utils.send200Response)(options.res, response);
  return true;
}