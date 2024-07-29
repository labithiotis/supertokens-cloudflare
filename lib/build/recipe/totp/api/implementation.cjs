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
var implementation_exports = {};
__export(implementation_exports, {
  default: () => getAPIInterface
});
module.exports = __toCommonJS(implementation_exports);
var import_multifactorauth = __toESM(require("../../multifactorauth"), 1);
var import_recipe = __toESM(require("../../multifactorauth/recipe"), 1);
var import_error = __toESM(require("../../session/error"), 1);
function getAPIInterface() {
  return {
    createDevicePOST: async function({ deviceName, options, session, userContext }) {
      const userId = session.getUserId();
      let mfaInstance = import_recipe.default.getInstance();
      if (mfaInstance === void 0) {
        throw new Error("should never come here");
      }
      await import_multifactorauth.default.assertAllowedToSetupFactorElseThrowInvalidClaimError(session, "totp", userContext);
      const createDeviceRes = await options.recipeImplementation.createDevice({
        userId,
        deviceName,
        userContext
      });
      if (createDeviceRes.status === "UNKNOWN_USER_ID_ERROR") {
        throw new import_error.default({
          type: import_error.default.UNAUTHORISED,
          message: "Session user not found"
        });
      } else {
        return createDeviceRes;
      }
    },
    listDevicesGET: async function({ options, session, userContext }) {
      const userId = session.getUserId();
      return await options.recipeImplementation.listDevices({
        userId,
        userContext
      });
    },
    removeDevicePOST: async function({ deviceName, options, session, userContext }) {
      const userId = session.getUserId();
      return await options.recipeImplementation.removeDevice({
        userId,
        deviceName,
        userContext
      });
    },
    verifyDevicePOST: async function({ deviceName, totp, options, session, userContext }) {
      const userId = session.getUserId();
      const tenantId = session.getTenantId();
      const mfaInstance = import_recipe.default.getInstance();
      if (mfaInstance === void 0) {
        throw new Error("should never come here");
      }
      await import_multifactorauth.default.assertAllowedToSetupFactorElseThrowInvalidClaimError(session, "totp", userContext);
      const res = await options.recipeImplementation.verifyDevice({
        tenantId,
        userId,
        deviceName,
        totp,
        userContext
      });
      if (res.status === "OK") {
        await mfaInstance.recipeInterfaceImpl.markFactorAsCompleteInSession({
          session,
          factorId: "totp",
          userContext
        });
      }
      return res;
    },
    verifyTOTPPOST: async function({ totp, options, session, userContext }) {
      const userId = session.getUserId();
      const tenantId = session.getTenantId();
      const mfaInstance = import_recipe.default.getInstance();
      if (mfaInstance === void 0) {
        throw new Error("should never come here");
      }
      const res = await options.recipeImplementation.verifyTOTP({
        tenantId,
        userId,
        totp,
        userContext
      });
      if (res.status === "OK") {
        await mfaInstance.recipeInterfaceImpl.markFactorAsCompleteInSession({
          session,
          factorId: "totp",
          userContext
        });
      }
      return res;
    }
  };
}
