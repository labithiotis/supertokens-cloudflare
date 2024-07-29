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
var recipeImplementation_exports = {};
__export(recipeImplementation_exports, {
  default: () => getRecipeInterface
});
module.exports = __toCommonJS(recipeImplementation_exports);
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import__ = require("../..");
function getRecipeInterface(querier, config) {
  return {
    getUserIdentifierInfoForUserId: async function({ userId, userContext }) {
      let user = await (0, import__.getUser)(userId, userContext);
      if (user === void 0) {
        return {
          status: "UNKNOWN_USER_ID_ERROR"
        };
      }
      const primaryLoginMethod = user.loginMethods.find(
        (method) => method.recipeUserId.getAsString() === user.id
      );
      if (primaryLoginMethod !== void 0) {
        if (primaryLoginMethod.email !== void 0) {
          return {
            info: primaryLoginMethod.email,
            status: "OK"
          };
        } else if (primaryLoginMethod.phoneNumber !== void 0) {
          return {
            info: primaryLoginMethod.phoneNumber,
            status: "OK"
          };
        }
      }
      if (user.emails.length > 0) {
        return { info: user.emails[0], status: "OK" };
      } else if (user.phoneNumbers.length > 0) {
        return { info: user.phoneNumbers[0], status: "OK" };
      }
      return {
        status: "USER_IDENTIFIER_INFO_DOES_NOT_EXIST_ERROR"
      };
    },
    createDevice: async function(input) {
      var _a, _b, _c;
      if (input.userIdentifierInfo === void 0) {
        const emailOrPhoneInfo = await this.getUserIdentifierInfoForUserId({
          userId: input.userId,
          userContext: input.userContext
        });
        if (emailOrPhoneInfo.status === "OK") {
          input.userIdentifierInfo = emailOrPhoneInfo.info;
        } else if (emailOrPhoneInfo.status === "UNKNOWN_USER_ID_ERROR") {
          return {
            status: "UNKNOWN_USER_ID_ERROR"
          };
        } else {
        }
      }
      const response = await querier.sendPostRequest(
        new import_normalisedURLPath.default("/recipe/totp/device"),
        {
          userId: input.userId,
          deviceName: input.deviceName,
          skew: (_a = input.skew) != null ? _a : config.defaultSkew,
          period: (_b = input.period) != null ? _b : config.defaultPeriod
        },
        input.userContext
      );
      return __spreadProps(__spreadValues({}, response), {
        qrCodeString: `otpauth://totp/${encodeURI(config.issuer)}${input.userIdentifierInfo !== void 0 ? ":" + encodeURI(input.userIdentifierInfo) : ""}?secret=${response.secret}&issuer=${encodeURI(config.issuer)}&digits=6&period=${(_c = input.period) != null ? _c : config.defaultPeriod}`
      });
    },
    updateDevice: (input) => {
      return querier.sendPutRequest(
        new import_normalisedURLPath.default("/recipe/totp/device"),
        {
          userId: input.userId,
          existingDeviceName: input.existingDeviceName,
          newDeviceName: input.newDeviceName
        },
        input.userContext
      );
    },
    listDevices: (input) => {
      return querier.sendGetRequest(
        new import_normalisedURLPath.default("/recipe/totp/device/list"),
        {
          userId: input.userId
        },
        input.userContext
      );
    },
    removeDevice: (input) => {
      return querier.sendPostRequest(
        new import_normalisedURLPath.default("/recipe/totp/device/remove"),
        {
          userId: input.userId,
          deviceName: input.deviceName
        },
        input.userContext
      );
    },
    verifyDevice: (input) => {
      return querier.sendPostRequest(
        new import_normalisedURLPath.default(`${input.tenantId}/recipe/totp/device/verify`),
        {
          userId: input.userId,
          deviceName: input.deviceName,
          totp: input.totp
        },
        input.userContext
      );
    },
    verifyTOTP: (input) => {
      return querier.sendPostRequest(
        new import_normalisedURLPath.default(`${input.tenantId}/recipe/totp/verify`),
        {
          userId: input.userId,
          totp: input.totp
        },
        input.userContext
      );
    }
  };
}
