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
  FORM_FIELD_EMAIL_ID: () => FORM_FIELD_EMAIL_ID,
  FORM_FIELD_PASSWORD_ID: () => FORM_FIELD_PASSWORD_ID,
  GENERATE_PASSWORD_RESET_TOKEN_API: () => GENERATE_PASSWORD_RESET_TOKEN_API,
  PASSWORD_RESET_API: () => PASSWORD_RESET_API,
  SIGNUP_EMAIL_EXISTS_API: () => SIGNUP_EMAIL_EXISTS_API,
  SIGNUP_EMAIL_EXISTS_API_OLD: () => SIGNUP_EMAIL_EXISTS_API_OLD,
  SIGN_IN_API: () => SIGN_IN_API,
  SIGN_UP_API: () => SIGN_UP_API
});
module.exports = __toCommonJS(constants_exports);
const FORM_FIELD_PASSWORD_ID = "password";
const FORM_FIELD_EMAIL_ID = "email";
const SIGN_UP_API = "/signup";
const SIGN_IN_API = "/signin";
const GENERATE_PASSWORD_RESET_TOKEN_API = "/user/password/reset/token";
const PASSWORD_RESET_API = "/user/password/reset";
const SIGNUP_EMAIL_EXISTS_API_OLD = "/signup/email/exists";
const SIGNUP_EMAIL_EXISTS_API = "/emailpassword/email/exists";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FORM_FIELD_EMAIL_ID,
  FORM_FIELD_PASSWORD_ID,
  GENERATE_PASSWORD_RESET_TOKEN_API,
  PASSWORD_RESET_API,
  SIGNUP_EMAIL_EXISTS_API,
  SIGNUP_EMAIL_EXISTS_API_OLD,
  SIGN_IN_API,
  SIGN_UP_API
});
