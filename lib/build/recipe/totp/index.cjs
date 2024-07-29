"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var totp_exports = {};
__export(totp_exports, {
  createDevice: () => createDevice,
  default: () => Wrapper,
  init: () => init,
  listDevices: () => listDevices,
  removeDevice: () => removeDevice,
  updateDevice: () => updateDevice,
  verifyDevice: () => verifyDevice,
  verifyTOTP: () => verifyTOTP
});
module.exports = __toCommonJS(totp_exports);
var import_utils = require("../../utils");
var import_recipe = __toESM(require("./recipe"), 1);
class Wrapper {
  static async createDevice(userId, userIdentifierInfo, deviceName, skew, period, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.createDevice({
      userId,
      userIdentifierInfo,
      deviceName,
      skew,
      period,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async updateDevice(userId, existingDeviceName, newDeviceName, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.updateDevice({
      userId,
      existingDeviceName,
      newDeviceName,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async listDevices(userId, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.listDevices({
      userId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async removeDevice(userId, deviceName, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.removeDevice({
      userId,
      deviceName,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async verifyDevice(tenantId, userId, deviceName, totp, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.verifyDevice({
      tenantId,
      userId,
      deviceName,
      totp,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async verifyTOTP(tenantId, userId, totp, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.verifyTOTP({
      tenantId,
      userId,
      totp,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
}
Wrapper.init = import_recipe.default.init;
let init = Wrapper.init;
let createDevice = Wrapper.createDevice;
let listDevices = Wrapper.listDevices;
let updateDevice = Wrapper.updateDevice;
let removeDevice = Wrapper.removeDevice;
let verifyDevice = Wrapper.verifyDevice;
let verifyTOTP = Wrapper.verifyTOTP;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createDevice,
  init,
  listDevices,
  removeDevice,
  updateDevice,
  verifyDevice,
  verifyTOTP
});
