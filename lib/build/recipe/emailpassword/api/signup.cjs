"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
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
var signup_exports = {};
__export(signup_exports, {
  default: () => signUpAPI
});
module.exports = __toCommonJS(signup_exports);
var import_utils = require("../../../utils");
var import_utils2 = require("./utils");
var import_error = __toESM(require("../error"), 1);
var import_session = __toESM(require("../../session"), 1);
async function signUpAPI(apiImplementation, tenantId, options, userContext) {
  if (apiImplementation.signUpPOST === void 0) {
    return false;
  }
  const requestBody = await options.req.getJSONBody();
  let formFields = await (0, import_utils2.validateFormFieldsOrThrowError)(
    options.config.signUpFeature.formFields,
    requestBody.formFields,
    tenantId,
    userContext
  );
  let session = await import_session.default.getSession(
    options.req,
    options.res,
    {
      sessionRequired: false,
      overrideGlobalClaimValidators: () => []
    },
    userContext
  );
  if (session !== void 0) {
    tenantId = session.getTenantId();
  }
  let result = await apiImplementation.signUpPOST({
    formFields,
    tenantId,
    session,
    options,
    userContext
  });
  if (result.status === "OK") {
    (0, import_utils.send200Response)(options.res, __spreadValues({
      status: "OK"
    }, (0, import_utils.getBackwardsCompatibleUserInfo)(options.req, result, userContext)));
  } else if (result.status === "GENERAL_ERROR") {
    (0, import_utils.send200Response)(options.res, result);
  } else if (result.status === "EMAIL_ALREADY_EXISTS_ERROR") {
    throw new import_error.default({
      type: import_error.default.FIELD_ERROR,
      payload: [
        {
          id: "email",
          error: "This email already exists. Please sign in instead."
        }
      ],
      message: "Error in input formFields"
    });
  } else {
    (0, import_utils.send200Response)(options.res, result);
  }
  return true;
}