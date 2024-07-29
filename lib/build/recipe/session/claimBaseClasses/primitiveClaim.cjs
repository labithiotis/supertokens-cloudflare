"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var primitiveClaim_exports = {};
__export(primitiveClaim_exports, {
  PrimitiveClaim: () => PrimitiveClaim
});
module.exports = __toCommonJS(primitiveClaim_exports);
var import_types = require("../types");
class PrimitiveClaim extends import_types.SessionClaim {
  constructor(config) {
    super(config.key);
    this.validators = {
      hasValue: (val, maxAgeInSeconds = this.defaultMaxAgeInSeconds, id) => {
        return {
          claim: this,
          id: id != null ? id : this.key,
          shouldRefetch: (payload, ctx) => this.getValueFromPayload(payload, ctx) === void 0 || maxAgeInSeconds !== void 0 && // We know payload[this.id] is defined since the value is not undefined in this branch
          payload[this.key].t < Date.now() - maxAgeInSeconds * 1e3,
          validate: async (payload, ctx) => {
            const claimVal = this.getValueFromPayload(payload, ctx);
            if (claimVal === void 0) {
              return {
                isValid: false,
                reason: { message: "value does not exist", expectedValue: val, actualValue: claimVal }
              };
            }
            const ageInSeconds = (Date.now() - this.getLastRefetchTime(payload, ctx)) / 1e3;
            if (maxAgeInSeconds !== void 0 && ageInSeconds > maxAgeInSeconds) {
              return {
                isValid: false,
                reason: {
                  message: "expired",
                  ageInSeconds,
                  maxAgeInSeconds
                }
              };
            }
            if (claimVal !== val) {
              return {
                isValid: false,
                reason: { message: "wrong value", expectedValue: val, actualValue: claimVal }
              };
            }
            return { isValid: true };
          }
        };
      }
    };
    this.fetchValue = config.fetchValue;
    this.defaultMaxAgeInSeconds = config.defaultMaxAgeInSeconds;
  }
  addToPayload_internal(payload, value, _userContext) {
    return __spreadProps(__spreadValues({}, payload), {
      [this.key]: {
        v: value,
        t: Date.now()
      }
    });
  }
  removeFromPayloadByMerge_internal(payload, _userContext) {
    const res = __spreadProps(__spreadValues({}, payload), {
      [this.key]: null
    });
    return res;
  }
  removeFromPayload(payload, _userContext) {
    const res = __spreadValues({}, payload);
    delete res[this.key];
    return res;
  }
  getValueFromPayload(payload, _userContext) {
    var _a;
    return (_a = payload[this.key]) == null ? void 0 : _a.v;
  }
  getLastRefetchTime(payload, _userContext) {
    var _a;
    return (_a = payload[this.key]) == null ? void 0 : _a.t;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PrimitiveClaim
});
