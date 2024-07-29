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
var emailVerificationClaim_exports = {};
__export(emailVerificationClaim_exports, {
  EmailVerificationClaim: () => EmailVerificationClaim,
  EmailVerificationClaimClass: () => EmailVerificationClaimClass
});
module.exports = __toCommonJS(emailVerificationClaim_exports);
var import_recipe = __toESM(require("./recipe"), 1);
var import_claims = require("../session/claims");
class EmailVerificationClaimClass extends import_claims.BooleanClaim {
  constructor() {
    super({
      key: "st-ev",
      async fetchValue(_userId, recipeUserId, __tenantId, _currentPayload, userContext) {
        const recipe = import_recipe.default.getInstanceOrThrowError();
        let emailInfo = await recipe.getEmailForRecipeUserId(void 0, recipeUserId, userContext);
        if (emailInfo.status === "OK") {
          return recipe.recipeInterfaceImpl.isEmailVerified({
            recipeUserId,
            email: emailInfo.email,
            userContext
          });
        } else if (emailInfo.status === "EMAIL_DOES_NOT_EXIST_ERROR") {
          return true;
        } else {
          throw new Error("UNKNOWN_USER_ID");
        }
      }
    });
    this.validators = __spreadProps(__spreadValues({}, this.validators), {
      isVerified: (refetchTimeOnFalseInSeconds = 10, maxAgeInSeconds) => __spreadProps(__spreadValues({}, this.validators.hasValue(true, maxAgeInSeconds)), {
        shouldRefetch: (payload, userContext) => {
          const value = this.getValueFromPayload(payload, userContext);
          if (value === void 0) {
            return true;
          }
          const currentTime = Date.now();
          const lastRefetchTime = this.getLastRefetchTime(payload, userContext);
          if (maxAgeInSeconds !== void 0) {
            if (lastRefetchTime < currentTime - maxAgeInSeconds * 1e3) {
              return true;
            }
          }
          if (value === false) {
            if (lastRefetchTime < currentTime - refetchTimeOnFalseInSeconds * 1e3) {
              return true;
            }
          }
          return false;
        }
      })
    });
  }
}
const EmailVerificationClaim = new EmailVerificationClaimClass();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EmailVerificationClaim,
  EmailVerificationClaimClass
});
