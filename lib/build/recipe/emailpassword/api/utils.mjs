var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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
import STError from "../error";
import { FORM_FIELD_EMAIL_ID, FORM_FIELD_PASSWORD_ID } from "../constants";
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
    if (curr.id === FORM_FIELD_EMAIL_ID || curr.id === FORM_FIELD_PASSWORD_ID) {
      if (typeof curr.value !== "string") {
        throw newBadRequestError("The value of formFields with id = " + curr.id + " must be a string");
      }
    }
    formFields.push(curr);
  }
  formFields = formFields.map((field) => {
    if (field.id === FORM_FIELD_EMAIL_ID) {
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
  return new STError({
    type: STError.BAD_INPUT_ERROR,
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
    throw new STError({
      type: STError.FIELD_ERROR,
      payload: validationErrors,
      message: "Error in input formFields"
    });
  }
}
export {
  validateFormFieldsOrThrowError
};
