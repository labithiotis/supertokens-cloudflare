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
import parsePhoneNumber from "libphonenumber-js/max";
import BackwardCompatibilityEmailService from "./emaildelivery/services/backwardCompatibility";
import BackwardCompatibilitySmsService from "./smsdelivery/services/backwardCompatibility";
import { FactorIds } from "../multifactorauth";
function validateAndNormaliseUserInput(_, appInfo, config) {
  if (config.contactMethod !== "PHONE" && config.contactMethod !== "EMAIL" && config.contactMethod !== "EMAIL_OR_PHONE") {
    throw new Error('Please pass one of "PHONE", "EMAIL" or "EMAIL_OR_PHONE" as the contactMethod');
  }
  if (config.flowType === void 0) {
    throw new Error("Please pass flowType argument in the config");
  }
  let override = __spreadValues({
    functions: (originalImplementation) => originalImplementation,
    apis: (originalImplementation) => originalImplementation
  }, config.override);
  function getEmailDeliveryConfig() {
    var _a;
    let emailService = (_a = config.emailDelivery) == null ? void 0 : _a.service;
    if (emailService === void 0) {
      emailService = new BackwardCompatibilityEmailService(appInfo);
    }
    let emailDelivery = __spreadProps(__spreadValues({}, config.emailDelivery), {
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
    return emailDelivery;
  }
  function getSmsDeliveryConfig() {
    var _a;
    let smsService = (_a = config.smsDelivery) == null ? void 0 : _a.service;
    if (smsService === void 0) {
      smsService = new BackwardCompatibilitySmsService();
    }
    let smsDelivery = __spreadProps(__spreadValues({}, config.smsDelivery), {
      /**
       * if we do
       * let smsDelivery = {
       *    service: smsService,
       *    ...config.smsDelivery,
       * };
       *
       * and if the user has passed service as undefined,
       * it it again get set to undefined, so we
       * set service at the end
       */
      service: smsService
    });
    return smsDelivery;
  }
  if (config.contactMethod === "EMAIL") {
    return {
      override,
      getEmailDeliveryConfig,
      getSmsDeliveryConfig,
      flowType: config.flowType,
      contactMethod: "EMAIL",
      validateEmailAddress: config.validateEmailAddress === void 0 ? defaultValidateEmail : config.validateEmailAddress,
      getCustomUserInputCode: config.getCustomUserInputCode
    };
  } else if (config.contactMethod === "PHONE") {
    return {
      override,
      getEmailDeliveryConfig,
      getSmsDeliveryConfig,
      flowType: config.flowType,
      contactMethod: "PHONE",
      validatePhoneNumber: config.validatePhoneNumber === void 0 ? defaultValidatePhoneNumber : config.validatePhoneNumber,
      getCustomUserInputCode: config.getCustomUserInputCode
    };
  } else {
    return {
      override,
      getEmailDeliveryConfig,
      getSmsDeliveryConfig,
      flowType: config.flowType,
      contactMethod: "EMAIL_OR_PHONE",
      validateEmailAddress: config.validateEmailAddress === void 0 ? defaultValidateEmail : config.validateEmailAddress,
      validatePhoneNumber: config.validatePhoneNumber === void 0 ? defaultValidatePhoneNumber : config.validatePhoneNumber,
      getCustomUserInputCode: config.getCustomUserInputCode
    };
  }
}
function defaultValidatePhoneNumber(value) {
  if (typeof value !== "string") {
    return "Development bug: Please make sure the phoneNumber field is a string";
  }
  let parsedPhoneNumber = parsePhoneNumber(value);
  if (parsedPhoneNumber === void 0 || !parsedPhoneNumber.isValid()) {
    return "Phone number is invalid";
  }
  return void 0;
}
function defaultValidateEmail(value) {
  if (typeof value !== "string") {
    return "Development bug: Please make sure the email field is a string";
  }
  if (value.match(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  ) === null) {
    return "Email is invalid";
  }
  return void 0;
}
function getEnabledPwlessFactors(config) {
  let allFactors;
  if (config.flowType === "MAGIC_LINK") {
    if (config.contactMethod === "EMAIL") {
      allFactors = [FactorIds.LINK_EMAIL];
    } else if (config.contactMethod === "PHONE") {
      allFactors = [FactorIds.LINK_PHONE];
    } else {
      allFactors = [FactorIds.LINK_EMAIL, FactorIds.LINK_PHONE];
    }
  } else if (config.flowType === "USER_INPUT_CODE") {
    if (config.contactMethod === "EMAIL") {
      allFactors = [FactorIds.OTP_EMAIL];
    } else if (config.contactMethod === "PHONE") {
      allFactors = [FactorIds.OTP_PHONE];
    } else {
      allFactors = [FactorIds.OTP_EMAIL, FactorIds.OTP_PHONE];
    }
  } else {
    if (config.contactMethod === "EMAIL") {
      allFactors = [FactorIds.OTP_EMAIL, FactorIds.LINK_EMAIL];
    } else if (config.contactMethod === "PHONE") {
      allFactors = [FactorIds.OTP_PHONE, FactorIds.LINK_PHONE];
    } else {
      allFactors = [FactorIds.OTP_EMAIL, FactorIds.OTP_PHONE, FactorIds.LINK_EMAIL, FactorIds.LINK_PHONE];
    }
  }
  return allFactors;
}
export {
  defaultValidateEmail,
  defaultValidatePhoneNumber,
  getEnabledPwlessFactors,
  validateAndNormaliseUserInput
};
