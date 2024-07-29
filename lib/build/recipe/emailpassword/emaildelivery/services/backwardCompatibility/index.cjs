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
var backwardCompatibility_exports = {};
__export(backwardCompatibility_exports, {
  default: () => BackwardCompatibilityService
});
module.exports = __toCommonJS(backwardCompatibility_exports);
var import_passwordResetFunctions = require("../../../passwordResetFunctions");
class BackwardCompatibilityService {
  constructor(appInfo, isInServerlessEnv) {
    this.sendEmail = async (input) => {
      try {
        if (!this.isInServerlessEnv) {
          (0, import_passwordResetFunctions.createAndSendEmailUsingSupertokensService)(
            this.appInfo,
            input.user,
            input.passwordResetLink
          ).catch((_) => {
          });
        } else {
          await (0, import_passwordResetFunctions.createAndSendEmailUsingSupertokensService)(this.appInfo, input.user, input.passwordResetLink);
        }
      } catch (_) {
      }
    };
    this.isInServerlessEnv = isInServerlessEnv;
    this.appInfo = appInfo;
  }
}
