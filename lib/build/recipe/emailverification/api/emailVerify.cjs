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
var emailVerify_exports = {};
__export(emailVerify_exports, {
  default: () => emailVerify
});
module.exports = __toCommonJS(emailVerify_exports);
var import_utils = require("../../../utils");
var import_error = __toESM(require("../error"), 1);
var import_session = __toESM(require("../../session"), 1);
async function emailVerify(apiImplementation, tenantId, options, userContext) {
  let result;
  if ((0, import_utils.normaliseHttpMethod)(options.req.getMethod()) === "post") {
    if (apiImplementation.verifyEmailPOST === void 0) {
      return false;
    }
    const requestBody = await options.req.getJSONBody();
    let token = requestBody.token;
    if (token === void 0 || token === null) {
      throw new import_error.default({
        type: import_error.default.BAD_INPUT_ERROR,
        message: "Please provide the email verification token"
      });
    }
    if (typeof token !== "string") {
      throw new import_error.default({
        type: import_error.default.BAD_INPUT_ERROR,
        message: "The email verification token must be a string"
      });
    }
    const session = await import_session.default.getSession(
      options.req,
      options.res,
      { overrideGlobalClaimValidators: () => [], sessionRequired: false },
      userContext
    );
    let response = await apiImplementation.verifyEmailPOST({
      token,
      tenantId,
      options,
      session,
      userContext
    });
    if (response.status === "OK") {
      result = { status: "OK" };
    } else {
      result = response;
    }
  } else {
    if (apiImplementation.isEmailVerifiedGET === void 0) {
      return false;
    }
    const session = await import_session.default.getSession(
      options.req,
      options.res,
      { overrideGlobalClaimValidators: () => [] },
      userContext
    );
    result = await apiImplementation.isEmailVerifiedGET({
      options,
      session,
      userContext
    });
  }
  (0, import_utils.send200Response)(options.res, result);
  return true;
}
