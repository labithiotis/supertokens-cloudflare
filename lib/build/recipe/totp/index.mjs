import { getUserContext } from "../../utils";
import Recipe from "./recipe";
class Wrapper {
  static async createDevice(userId, userIdentifierInfo, deviceName, skew, period, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.createDevice({
      userId,
      userIdentifierInfo,
      deviceName,
      skew,
      period,
      userContext: getUserContext(userContext)
    });
  }
  static async updateDevice(userId, existingDeviceName, newDeviceName, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.updateDevice({
      userId,
      existingDeviceName,
      newDeviceName,
      userContext: getUserContext(userContext)
    });
  }
  static async listDevices(userId, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.listDevices({
      userId,
      userContext: getUserContext(userContext)
    });
  }
  static async removeDevice(userId, deviceName, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.removeDevice({
      userId,
      deviceName,
      userContext: getUserContext(userContext)
    });
  }
  static async verifyDevice(tenantId, userId, deviceName, totp, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.verifyDevice({
      tenantId,
      userId,
      deviceName,
      totp,
      userContext: getUserContext(userContext)
    });
  }
  static async verifyTOTP(tenantId, userId, totp, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.verifyTOTP({
      tenantId,
      userId,
      totp,
      userContext: getUserContext(userContext)
    });
  }
}
Wrapper.init = Recipe.init;
let init = Wrapper.init;
let createDevice = Wrapper.createDevice;
let listDevices = Wrapper.listDevices;
let updateDevice = Wrapper.updateDevice;
let removeDevice = Wrapper.removeDevice;
let verifyDevice = Wrapper.verifyDevice;
let verifyTOTP = Wrapper.verifyTOTP;
export {
  createDevice,
  Wrapper as default,
  init,
  listDevices,
  removeDevice,
  updateDevice,
  verifyDevice,
  verifyTOTP
};
