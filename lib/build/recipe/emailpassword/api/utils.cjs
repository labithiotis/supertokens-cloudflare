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
var utils_exports = {};
__export(utils_exports, {
  validateFormFieldsOrThrowError: () => validateFormFieldsOrThrowError
});
module.exports = __toCommonJS(utils_exports);
var import_error = __toESM(require("../error"), 1);
var import_constants = require("../constants");
async function validateFormFieldsOrThrowError(configFormFields, formFieldsRaw, tenantId, userContext) {
  if (formFieldsRaw === void 0) {
    throw newBadRequestError("Missing input param: formFields");
  }
  if (!Array.isArray(formFieldsRaw)) {
    throw newBadRequestError("formFields must be an array");
  }
  let formFields = [];
  for (let i = 0; i < formFieldsRaw.length; i++) {
    let curr = formFieldsRaw[i];
    if (typeof curr !== "object" || curr === null) {
      throw newBadRequestError("All elements of formFields must be an object");
    }
    if (typeof curr.id !== "string" || curr.value === void 0) {
      throw newBadRequestError("All elements of formFields must contain an 'id' and 'value' field");
    }
    if (curr.id === import_constants.FORM_FIELD_EMAIL_ID || curr.id === import_constants.FORM_FIELD_PASSWORD_ID) {
      if (typeof curr.value !== "string") {
        throw newBadRequestError("The value of formFields with id = " + curr.id + " must be a string");
      }
    }
    formFields.push(curr);
  }
  formFields = formFields.map((field) => {
    if (field.id === import_constants.FORM_FIELD_EMAIL_ID) {
      return __spreadProps(__spreadValues({}, field), {
        value: field.value.trim()
      });
    }
    return field;
  });
  await validateFormOrThrowError(formFields, configFormFields, tenantId, userContext);
  return formFields;
}
function newBadRequestError(message) {
  return new import_error.default({
    type: import_error.default.BAD_INPUT_ERROR,
    message
  });
}
async function validateFormOrThrowError(inputs, configFormFields, tenantId, userContext) {
  let validationErrors = [];
  if (configFormFields.length !== inputs.length) {
    throw newBadRequestError("Are you sending too many / too few formFields?");
  }
  for (let i = 0; i < configFormFields.length; i++) {
    const field = configFormFields[i];
    const input = inputs.find((i2) => i2.id === field.id);
    if (input === void 0 || input.value === "" && !field.optional) {
      validationErrors.push({
        error: "Field is not optional",
        id: field.id
      });
    } else {
      const error = await field.validate(input.value, tenantId, userContext);
      if (error !== void 0) {
        validationErrors.push({
          error,
          id: field.id
        });
      }
    }
  }
  if (validationErrors.length !== 0) {
    throw new import_error.default({
      type: import_error.default.FIELD_ERROR,
      payload: validationErrors,
      message: "Error in input formFields"
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  validateFormFieldsOrThrowError
});
