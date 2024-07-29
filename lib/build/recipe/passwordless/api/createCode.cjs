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
var createCode_exports = {};
__export(createCode_exports, {
  default: () => createCode
});
module.exports = __toCommonJS(createCode_exports);
var import_utils = require("../../../utils");
var import_error = __toESM(require("../error"), 1);
var import_max = __toESM(require("libphonenumber-js/max"), 1);
var import_session = __toESM(require("../../session"), 1);
async function createCode(apiImplementation, tenantId, options, userContext) {
  if (apiImplementation.createCodePOST === void 0) {
    return false;
  }
  const body = await options.req.getJSONBody();
  let email = body.email;
  let phoneNumber = body.phoneNumber;
  if (email !== void 0 && phoneNumber !== void 0 || email === void 0 && phoneNumber === void 0) {
    throw new import_error.default({
      type: import_error.default.BAD_INPUT_ERROR,
      message: "Please provide exactly one of email or phoneNumber"
    });
  }
  if (email === void 0 && options.config.contactMethod === "EMAIL") {
    throw new import_error.default({
      type: import_error.default.BAD_INPUT_ERROR,
      message: 'Please provide an email since you have set the contactMethod to "EMAIL"'
    });
  }
  if (phoneNumber === void 0 && options.config.contactMethod === "PHONE") {
    throw new import_error.default({
      type: import_error.default.BAD_INPUT_ERROR,
      message: 'Please provide a phoneNumber since you have set the contactMethod to "PHONE"'
    });
  }
  if (email !== void 0 && (options.config.contactMethod === "EMAIL" || options.config.contactMethod === "EMAIL_OR_PHONE")) {
    email = email.trim();
    const validateError = await options.config.validateEmailAddress(email, tenantId);
    if (validateError !== void 0) {
      (0, import_utils.send200Response)(options.res, {
        status: "GENERAL_ERROR",
        message: validateError
      });
      return true;
    }
  }
  if (phoneNumber !== void 0 && (options.config.contactMethod === "PHONE" || options.config.contactMethod === "EMAIL_OR_PHONE")) {
    const validateError = await options.config.validatePhoneNumber(phoneNumber, tenantId);
    if (validateError !== void 0) {
      (0, import_utils.send200Response)(options.res, {
        status: "GENERAL_ERROR",
        message: validateError
      });
      return true;
    }
    const parsedPhoneNumber = (0, import_max.default)(phoneNumber);
    if (parsedPhoneNumber === void 0) {
      phoneNumber = phoneNumber.trim();
    } else {
      phoneNumber = parsedPhoneNumber.format("E.164");
    }
  }
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
  let result = await apiImplementation.createCodePOST(
    email !== void 0 ? { email, session, tenantId, options, userContext } : { phoneNumber, session, tenantId, options, userContext }
  );
  (0, import_utils.send200Response)(options.res, result);
  return true;
}
