"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var constants_exports = {};
__export(constants_exports, {
  CONSUME_CODE_API: () => CONSUME_CODE_API,
  CREATE_CODE_API: () => CREATE_CODE_API,
  DOES_EMAIL_EXIST_API: () => DOES_EMAIL_EXIST_API,
  DOES_EMAIL_EXIST_API_OLD: () => DOES_EMAIL_EXIST_API_OLD,
  DOES_PHONE_NUMBER_EXIST_API: () => DOES_PHONE_NUMBER_EXIST_API,
  DOES_PHONE_NUMBER_EXIST_API_OLD: () => DOES_PHONE_NUMBER_EXIST_API_OLD,
  RESEND_CODE_API: () => RESEND_CODE_API
});
module.exports = __toCommonJS(constants_exports);
const CREATE_CODE_API = "/signinup/code";
const RESEND_CODE_API = "/signinup/code/resend";
const CONSUME_CODE_API = "/signinup/code/consume";
const DOES_EMAIL_EXIST_API_OLD = "/signup/email/exists";
const DOES_EMAIL_EXIST_API = "/passwordless/email/exists";
const DOES_PHONE_NUMBER_EXIST_API_OLD = "/signup/phonenumber/exists";
const DOES_PHONE_NUMBER_EXIST_API = "/passwordless/phonenumber/exists";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CONSUME_CODE_API,
  CREATE_CODE_API,
  DOES_EMAIL_EXIST_API,
  DOES_EMAIL_EXIST_API_OLD,
  DOES_PHONE_NUMBER_EXIST_API,
  DOES_PHONE_NUMBER_EXIST_API_OLD,
  RESEND_CODE_API
});
