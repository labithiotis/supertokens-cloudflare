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
import { FORM_FIELD_EMAIL_ID, FORM_FIELD_PASSWORD_ID } from "./constants";
import BackwardCompatibilityService from "./emaildelivery/services/backwardCompatibility";
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
      emailService = new BackwardCompatibilityService(appInfo, isInServerlessEnv);
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
  let formFieldsForPasswordResetForm = signUpConfig.formFields.filter((filter) => filter.id === FORM_FIELD_PASSWORD_ID).map((field) => {
    return {
      id: field.id,
      validate: field.validate,
      optional: false
    };
  });
  let formFieldsForGenerateTokenForm = signUpConfig.formFields.filter((filter) => filter.id === FORM_FIELD_EMAIL_ID).map((field) => {
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
  return formFields.filter((filter) => filter.id === FORM_FIELD_EMAIL_ID || filter.id === FORM_FIELD_PASSWORD_ID).map((field) => {
    return {
      id: field.id,
      // see issue: https://github.com/supertokens/supertokens-node/issues/36
      validate: field.id === FORM_FIELD_EMAIL_ID ? field.validate : defaultValidator,
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
      if (field.id === FORM_FIELD_PASSWORD_ID) {
        normalisedFormFields.push({
          id: field.id,
          validate: field.validate === void 0 ? defaultPasswordValidator : field.validate,
          optional: false
        });
      } else if (field.id === FORM_FIELD_EMAIL_ID) {
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
  if (normalisedFormFields.filter((field) => field.id === FORM_FIELD_PASSWORD_ID).length === 0) {
    normalisedFormFields.push({
      id: FORM_FIELD_PASSWORD_ID,
      validate: defaultPasswordValidator,
      optional: false
    });
  }
  if (normalisedFormFields.filter((field) => field.id === FORM_FIELD_EMAIL_ID).length === 0) {
    normalisedFormFields.push({
      id: FORM_FIELD_EMAIL_ID,
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
export {
  defaultEmailValidator,
  defaultPasswordValidator,
  getPasswordResetLink,
  normaliseSignUpFormFields,
  validateAndNormaliseUserInput
};
