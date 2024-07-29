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
var passwordlessUser_exports = {};
__export(passwordlessUser_exports, {
  createPasswordlessUser: () => createPasswordlessUser
});
module.exports = __toCommonJS(passwordlessUser_exports);
var import_error = __toESM(require("../../../../../error"), 1);
var import_passwordless = __toESM(require("../../../../passwordless"), 1);
var import_recipe = __toESM(require("../../../../passwordless/recipe"), 1);
var import_max = require("libphonenumber-js/max");
const createPasswordlessUser = async (_, tenantId, options, __) => {
  let passwordlessRecipe = void 0;
  try {
    passwordlessRecipe = import_recipe.default.getInstanceOrThrowError();
  } catch (_2) {
    return {
      status: "FEATURE_NOT_ENABLED_ERROR"
    };
  }
  const requestBody = await options.req.getJSONBody();
  let email = requestBody.email;
  let phoneNumber = requestBody.phoneNumber;
  if (email !== void 0 && phoneNumber !== void 0 || email === void 0 && phoneNumber === void 0) {
    throw new import_error.default({
      type: import_error.default.BAD_INPUT_ERROR,
      message: "Please provide exactly one of email or phoneNumber"
    });
  }
  if (email !== void 0 && (passwordlessRecipe.config.contactMethod === "EMAIL" || passwordlessRecipe.config.contactMethod === "EMAIL_OR_PHONE")) {
    email = email.trim();
    let validationError = void 0;
    validationError = await passwordlessRecipe.config.validateEmailAddress(email, tenantId);
    if (validationError !== void 0) {
      return {
        status: "EMAIL_VALIDATION_ERROR",
        message: validationError
      };
    }
  }
  if (phoneNumber !== void 0 && (passwordlessRecipe.config.contactMethod === "PHONE" || passwordlessRecipe.config.contactMethod === "EMAIL_OR_PHONE")) {
    let validationError = void 0;
    validationError = await passwordlessRecipe.config.validatePhoneNumber(phoneNumber, tenantId);
    if (validationError !== void 0) {
      return {
        status: "PHONE_VALIDATION_ERROR",
        message: validationError
      };
    }
    const parsedPhoneNumber = (0, import_max.parsePhoneNumber)(phoneNumber);
    if (parsedPhoneNumber === void 0) {
      phoneNumber = phoneNumber.trim();
    } else {
      phoneNumber = parsedPhoneNumber.format("E.164");
    }
  }
  return await import_passwordless.default.signInUp(
    email !== void 0 ? { email, tenantId } : { phoneNumber, tenantId }
  );
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createPasswordlessUser
});
