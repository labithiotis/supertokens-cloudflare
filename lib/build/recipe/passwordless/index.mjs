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
import Recipe from "./recipe";
import SuperTokensError from "./error";
import { getRequestFromUserContext } from "../..";
import { getUserContext } from "../../utils";
class Wrapper {
  static createCode(input) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.createCode(__spreadProps(__spreadValues({}, input), {
      session: input.session,
      userContext: getUserContext(input.userContext)
    }));
  }
  static createNewCodeForDevice(input) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.createNewCodeForDevice(__spreadProps(__spreadValues({}, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
  static consumeCode(input) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.consumeCode(__spreadProps(__spreadValues({}, input), {
      session: input.session,
      userContext: getUserContext(input.userContext)
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
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.checkCode(__spreadProps(__spreadValues({}, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
  static updateUser(input) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.updateUser(__spreadProps(__spreadValues({}, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
  static revokeAllCodes(input) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.revokeAllCodes(__spreadProps(__spreadValues({}, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
  static revokeCode(input) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.revokeCode(__spreadProps(__spreadValues({}, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
  static listCodesByEmail(input) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.listCodesByEmail(__spreadProps(__spreadValues({}, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
  static listCodesByPhoneNumber(input) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.listCodesByPhoneNumber(__spreadProps(__spreadValues({}, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
  static listCodesByDeviceId(input) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.listCodesByDeviceId(__spreadProps(__spreadValues({}, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
  static listCodesByPreAuthSessionId(input) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.listCodesByPreAuthSessionId(__spreadProps(__spreadValues({}, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
  static createMagicLink(input) {
    const ctx = getUserContext(input.userContext);
    return Recipe.getInstanceOrThrowError().createMagicLink(__spreadProps(__spreadValues({}, input), {
      request: getRequestFromUserContext(ctx),
      userContext: ctx
    }));
  }
  static signInUp(input) {
    return Recipe.getInstanceOrThrowError().signInUp(__spreadProps(__spreadValues({}, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
  static async sendEmail(input) {
    return await Recipe.getInstanceOrThrowError().emailDelivery.ingredientInterfaceImpl.sendEmail(__spreadProps(__spreadValues({}, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
  static async sendSms(input) {
    return await Recipe.getInstanceOrThrowError().smsDelivery.ingredientInterfaceImpl.sendSms(__spreadProps(__spreadValues({}, input), {
      userContext: getUserContext(input.userContext)
    }));
  }
}
Wrapper.init = Recipe.init;
Wrapper.Error = SuperTokensError;
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
export {
  Error2 as Error,
  checkCode,
  consumeCode,
  createCode,
  createMagicLink,
  createNewCodeForDevice,
  Wrapper as default,
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
};
