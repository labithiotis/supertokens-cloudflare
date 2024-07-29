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
var passwordless_exports = {};
__export(passwordless_exports, {
  Error: () => Error2,
  checkCode: () => checkCode,
  consumeCode: () => consumeCode,
  createCode: () => createCode,
  createMagicLink: () => createMagicLink,
  createNewCodeForDevice: () => createNewCodeForDevice,
  default: () => Wrapper,
  init: () => init,
  listCodesByDeviceId: () => listCodesByDeviceId,
  listCodesByEmail: () => listCodesByEmail,
  listCodesByPhoneNumber: () => listCodesByPhoneNumber,
  listCodesByPreAuthSessionId: () => listCodesByPreAuthSessionId,
  revokeAllCodes: () => revokeAllCodes,
  revokeCode: () => revokeCode,
  sendEmail: () => sendEmail,
  sendSms: () => sendSms,
  signInUp: () => signInUp,
  updateUser: () => updateUser
});
module.exports = __toCommonJS(passwordless_exports);
var import_recipe = __toESM(require("./recipe"), 1);
var import_error = __toESM(require("./error"), 1);
var import__ = require("../..");
var import_utils = require("../../utils");
class Wrapper {
  static createCode(input) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.createCode(__spreadProps(__spreadValues({}, input), {
      session: input.session,
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  static createNewCodeForDevice(input) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.createNewCodeForDevice(__spreadProps(__spreadValues({}, input), {
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  static consumeCode(input) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.consumeCode(__spreadProps(__spreadValues({}, input), {
      session: input.session,
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  /**
   * This function will only verify the code (not consume it), and:
   * NOT create a new user if it doesn't exist
   * NOT verify the user email if it exists
   * NOT do any linking
   * NOT delete the code unless it returned RESTART_FLOW_ERROR
   */
  static checkCode(input) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.checkCode(__spreadProps(__spreadValues({}, input), {
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  static updateUser(input) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.updateUser(__spreadProps(__spreadValues({}, input), {
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  static revokeAllCodes(input) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.revokeAllCodes(__spreadProps(__spreadValues({}, input), {
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  static revokeCode(input) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.revokeCode(__spreadProps(__spreadValues({}, input), {
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  static listCodesByEmail(input) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.listCodesByEmail(__spreadProps(__spreadValues({}, input), {
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  static listCodesByPhoneNumber(input) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.listCodesByPhoneNumber(__spreadProps(__spreadValues({}, input), {
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  static listCodesByDeviceId(input) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.listCodesByDeviceId(__spreadProps(__spreadValues({}, input), {
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  static listCodesByPreAuthSessionId(input) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.listCodesByPreAuthSessionId(__spreadProps(__spreadValues({}, input), {
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  static createMagicLink(input) {
    const ctx = (0, import_utils.getUserContext)(input.userContext);
    return import_recipe.default.getInstanceOrThrowError().createMagicLink(__spreadProps(__spreadValues({}, input), {
      request: (0, import__.getRequestFromUserContext)(ctx),
      userContext: ctx
    }));
  }
  static signInUp(input) {
    return import_recipe.default.getInstanceOrThrowError().signInUp(__spreadProps(__spreadValues({}, input), {
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  static async sendEmail(input) {
    return await import_recipe.default.getInstanceOrThrowError().emailDelivery.ingredientInterfaceImpl.sendEmail(__spreadProps(__spreadValues({}, input), {
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
  static async sendSms(input) {
    return await import_recipe.default.getInstanceOrThrowError().smsDelivery.ingredientInterfaceImpl.sendSms(__spreadProps(__spreadValues({}, input), {
      userContext: (0, import_utils.getUserContext)(input.userContext)
    }));
  }
}
Wrapper.init = import_recipe.default.init;
Wrapper.Error = import_error.default;
let init = Wrapper.init;
let Error2 = Wrapper.Error;
let createCode = Wrapper.createCode;
let consumeCode = Wrapper.consumeCode;
let listCodesByDeviceId = Wrapper.listCodesByDeviceId;
let listCodesByEmail = Wrapper.listCodesByEmail;
let listCodesByPhoneNumber = Wrapper.listCodesByPhoneNumber;
let listCodesByPreAuthSessionId = Wrapper.listCodesByPreAuthSessionId;
let createNewCodeForDevice = Wrapper.createNewCodeForDevice;
let updateUser = Wrapper.updateUser;
let revokeAllCodes = Wrapper.revokeAllCodes;
let revokeCode = Wrapper.revokeCode;
let createMagicLink = Wrapper.createMagicLink;
let signInUp = Wrapper.signInUp;
let checkCode = Wrapper.checkCode;
let sendEmail = Wrapper.sendEmail;
let sendSms = Wrapper.sendSms;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Error,
  checkCode,
  consumeCode,
  createCode,
  createMagicLink,
  createNewCodeForDevice,
  init,
  listCodesByDeviceId,
  listCodesByEmail,
  listCodesByPhoneNumber,
  listCodesByPreAuthSessionId,
  revokeAllCodes,
  revokeCode,
  sendEmail,
  sendSms,
  signInUp,
  updateUser
});
