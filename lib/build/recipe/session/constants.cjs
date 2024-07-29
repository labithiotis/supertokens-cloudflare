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
  JWKCacheCooldownInMs: () => JWKCacheCooldownInMs,
  REFRESH_API_PATH: () => REFRESH_API_PATH,
  SIGNOUT_API_PATH: () => SIGNOUT_API_PATH,
  availableTokenTransferMethods: () => availableTokenTransferMethods,
  oneYearInMs: () => oneYearInMs,
  protectedProps: () => protectedProps
});
module.exports = __toCommonJS(constants_exports);
const REFRESH_API_PATH = "/session/refresh";
const SIGNOUT_API_PATH = "/signout";
const availableTokenTransferMethods = ["cookie", "header"];
const oneYearInMs = 31536e6;
const JWKCacheCooldownInMs = 500;
const protectedProps = [
  "sub",
  "iat",
  "exp",
  "sessionHandle",
  "parentRefreshTokenHash1",
  "refreshTokenHash1",
  "antiCsrfToken",
  "rsub",
  "tId"
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  JWKCacheCooldownInMs,
  REFRESH_API_PATH,
  SIGNOUT_API_PATH,
  availableTokenTransferMethods,
  oneYearInMs,
  protectedProps
});
