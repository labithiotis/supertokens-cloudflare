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
  defaultEmailValidator: () => defaultEmailValidator,
  defaultPasswordValidator: () => defaultPasswordValidator,
  getPasswordResetLink: () => getPasswordResetLink,
  normaliseSignUpFormFields: () => normaliseSignUpFormFields,
  validateAndNormaliseUserInput: () => validateAndNormaliseUserInput
});
module.exports = __toCommonJS(utils_exports);
var import_constants = require("./constants");
var import_backwardCompatibility = __toESM(require("./emaildelivery/services/backwardCompatibility"), 1);
function validateAndNormaliseUserInput(recipeInstance, appInfo, config) {
  let signUpFeature = validateAndNormaliseSignupConfig(
    recipeInstance,
    appInfo,
    config === void 0 ? void 0 : config.signUpFeature
  );
  let signInFeature = validateAndNormaliseSignInConfig(recipeInstance, appInfo, signUpFeature);
  let resetPasswordUsingTokenFeature = validateAndNormaliseResetPasswordUsingTokenConfig(signUpFeature);
  let override = __spreadValues({
    functions: (originalImplementation) => originalImplementation,
    apis: (originalImplementation) => originalImplementation
  }, config == null ? void 0 : config.override);
  function getEmailDeliveryConfig(isInServerlessEnv) {
    var _a;
    let emailService = (_a = config == null ? void 0 : config.emailDelivery) == null ? void 0 : _a.service;
    if (emailService === void 0) {
      emailService = new import_backwardCompatibility.default(appInfo, isInServerlessEnv);
    }
    return __spreadProps(__spreadValues({}, config == null ? void 0 : config.emailDelivery), {
      /**
       * if we do
       * let emailDelivery = {
       *    service: emailService,
       *    ...config.emailDelivery,
       * };
       *
       * and if the user has passed service as undefined,
       * it it again get set to undefined, so we
       * set service at the end
       */
      service: emailService
    });
  }
  return {
    signUpFeature,
    signInFeature,
    resetPasswordUsingTokenFeature,
    override,
    getEmailDeliveryConfig
  };
}
function validateAndNormaliseResetPasswordUsingTokenConfig(signUpConfig) {
  let formFieldsForPasswordResetForm = signUpConfig.formFields.filter((filter) => filter.id === import_constants.FORM_FIELD_PASSWORD_ID).map((field) => {
    return {
      id: field.id,
      validate: field.validate,
      optional: false
    };
  });
  let formFieldsForGenerateTokenForm = signUpConfig.formFields.filter((filter) => filter.id === import_constants.FORM_FIELD_EMAIL_ID).map((field) => {
    return {
      id: field.id,
      validate: field.validate,
      optional: false
    };
  });
  return {
    formFieldsForPasswordResetForm,
    formFieldsForGenerateTokenForm
  };
}
function normaliseSignInFormFields(formFields) {
  return formFields.filter((filter) => filter.id === import_constants.FORM_FIELD_EMAIL_ID || filter.id === import_constants.FORM_FIELD_PASSWORD_ID).map((field) => {
    return {
      id: field.id,
      // see issue: https://github.com/supertokens/supertokens-node/issues/36
      validate: field.id === import_constants.FORM_FIELD_EMAIL_ID ? field.validate : defaultValidator,
      optional: false
    };
  });
}
function validateAndNormaliseSignInConfig(_, __, signUpConfig) {
  let formFields = normaliseSignInFormFields(signUpConfig.formFields);
  return {
    formFields
  };
}
function normaliseSignUpFormFields(formFields) {
  let normalisedFormFields = [];
  if (formFields !== void 0) {
    formFields.forEach((field) => {
      if (field.id === import_constants.FORM_FIELD_PASSWORD_ID) {
        normalisedFormFields.push({
          id: field.id,
          validate: field.validate === void 0 ? defaultPasswordValidator : field.validate,
          optional: false
        });
      } else if (field.id === import_constants.FORM_FIELD_EMAIL_ID) {
        normalisedFormFields.push({
          id: field.id,
          validate: field.validate === void 0 ? defaultEmailValidator : field.validate,
          optional: false
        });
      } else {
        normalisedFormFields.push({
          id: field.id,
          validate: field.validate === void 0 ? defaultValidator : field.validate,
          optional: field.optional === void 0 ? false : field.optional
        });
      }
    });
  }
  if (normalisedFormFields.filter((field) => field.id === import_constants.FORM_FIELD_PASSWORD_ID).length === 0) {
    normalisedFormFields.push({
      id: import_constants.FORM_FIELD_PASSWORD_ID,
      validate: defaultPasswordValidator,
      optional: false
    });
  }
  if (normalisedFormFields.filter((field) => field.id === import_constants.FORM_FIELD_EMAIL_ID).length === 0) {
    normalisedFormFields.push({
      id: import_constants.FORM_FIELD_EMAIL_ID,
      validate: defaultEmailValidator,
      optional: false
    });
  }
  return normalisedFormFields;
}
function validateAndNormaliseSignupConfig(_, __, config) {
  let formFields = normaliseSignUpFormFields(
    config === void 0 ? void 0 : config.formFields
  );
  return {
    formFields
  };
}
async function defaultValidator(_) {
  return void 0;
}
async function defaultPasswordValidator(value) {
  if (typeof value !== "string") {
    return "Development bug: Please make sure the password field yields a string";
  }
  if (value.length < 8) {
    return "Password must contain at least 8 characters, including a number";
  }
  if (value.length >= 100) {
    return "Password's length must be lesser than 100 characters";
  }
  if (value.match(/^.*[A-Za-z]+.*$/) === null) {
    return "Password must contain at least one alphabet";
  }
  if (value.match(/^.*[0-9]+.*$/) === null) {
    return "Password must contain at least one number";
  }
  return void 0;
}
async function defaultEmailValidator(value) {
  if (typeof value !== "string") {
    return "Development bug: Please make sure the email field yields a string";
  }
  if (value.match(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  ) === null) {
    return "Email is invalid";
  }
  return void 0;
}
function getPasswordResetLink(input) {
  return input.appInfo.getOrigin({
    request: input.request,
    userContext: input.userContext
  }).getAsStringDangerous() + input.appInfo.websiteBasePath.getAsStringDangerous() + "/reset-password?token=" + input.token + "&tenantId=" + input.tenantId;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  defaultEmailValidator,
  defaultPasswordValidator,
  getPasswordResetLink,
  normaliseSignUpFormFields,
  validateAndNormaliseUserInput
});
