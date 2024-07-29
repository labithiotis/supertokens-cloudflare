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
  CREATE_TOTP_DEVICE: () => CREATE_TOTP_DEVICE,
  LIST_TOTP_DEVICES: () => LIST_TOTP_DEVICES,
  REMOVE_TOTP_DEVICE: () => REMOVE_TOTP_DEVICE,
  VERIFY_TOTP: () => VERIFY_TOTP,
  VERIFY_TOTP_DEVICE: () => VERIFY_TOTP_DEVICE
});
module.exports = __toCommonJS(constants_exports);
const CREATE_TOTP_DEVICE = "/totp/device";
const LIST_TOTP_DEVICES = "/totp/device/list";
const REMOVE_TOTP_DEVICE = "/totp/device/remove";
const VERIFY_TOTP_DEVICE = "/totp/device/verify";
const VERIFY_TOTP = "/totp/verify";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CREATE_TOTP_DEVICE,
  LIST_TOTP_DEVICES,
  REMOVE_TOTP_DEVICE,
  VERIFY_TOTP,
  VERIFY_TOTP_DEVICE
});
