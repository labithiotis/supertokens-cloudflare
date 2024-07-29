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
import { SessionClaim } from "../types";
class PrimitiveArrayClaim extends SessionClaim {
  constructor(config) {
    super(config.key);
    this.validators = {
      includes: (val, maxAgeInSeconds = this.defaultMaxAgeInSeconds, id) => {
        return {
          claim: this,
          id: id != null ? id : this.key,
          shouldRefetch: (payload, ctx) => this.getValueFromPayload(payload, ctx) === void 0 || // We know payload[this.id] is defined since the value is not undefined in this branch
          maxAgeInSeconds !== void 0 && payload[this.key].t < Date.now() - maxAgeInSeconds * 1e3,
          validate: async (payload, ctx) => {
            const claimVal = this.getValueFromPayload(payload, ctx);
            if (claimVal === void 0) {
              return {
                isValid: false,
                reason: { message: "value does not exist", expectedToInclude: val, actualValue: claimVal }
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
            if (!claimVal.includes(val)) {
              return {
                isValid: false,
                reason: { message: "wrong value", expectedToInclude: val, actualValue: claimVal }
              };
            }
            return { isValid: true };
          }
        };
      },
      excludes: (val, maxAgeInSeconds = this.defaultMaxAgeInSeconds, id) => {
        return {
          claim: this,
          id: id != null ? id : this.key,
          shouldRefetch: (payload, ctx) => this.getValueFromPayload(payload, ctx) === void 0 || // We know payload[this.id] is defined since the value is not undefined in this branch
          maxAgeInSeconds !== void 0 && payload[this.key].t < Date.now() - maxAgeInSeconds * 1e3,
          validate: async (payload, ctx) => {
            const claimVal = this.getValueFromPayload(payload, ctx);
            if (claimVal === void 0) {
              return {
                isValid: false,
                reason: {
                  message: "value does not exist",
                  expectedToNotInclude: val,
                  actualValue: claimVal
                }
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
            if (claimVal.includes(val)) {
              return {
                isValid: false,
                reason: { message: "wrong value", expectedToNotInclude: val, actualValue: claimVal }
              };
            }
            return { isValid: true };
          }
        };
      },
      includesAll: (val, maxAgeInSeconds = this.defaultMaxAgeInSeconds, id) => {
        return {
          claim: this,
          id: id != null ? id : this.key,
          shouldRefetch: (payload, ctx) => this.getValueFromPayload(payload, ctx) === void 0 || // We know payload[this.id] is defined since the value is not undefined in this branch
          maxAgeInSeconds !== void 0 && payload[this.key].t < Date.now() - maxAgeInSeconds * 1e3,
          validate: async (payload, ctx) => {
            const claimVal = this.getValueFromPayload(payload, ctx);
            if (claimVal === void 0) {
              return {
                isValid: false,
                reason: { message: "value does not exist", expectedToInclude: val, actualValue: claimVal }
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
            const claimSet = new Set(claimVal);
            const isValid = val.every((v) => claimSet.has(v));
            return isValid ? { isValid } : {
              isValid,
              reason: { message: "wrong value", expectedToInclude: val, actualValue: claimVal }
            };
          }
        };
      },
      includesAny: (val, maxAgeInSeconds = this.defaultMaxAgeInSeconds, id) => {
        return {
          claim: this,
          id: id != null ? id : this.key,
          shouldRefetch: (payload, ctx) => this.getValueFromPayload(payload, ctx) === void 0 || // We know payload[this.id] is defined since the value is not undefined in this branch
          maxAgeInSeconds !== void 0 && payload[this.key].t < Date.now() - maxAgeInSeconds * 1e3,
          validate: async (payload, ctx) => {
            const claimVal = this.getValueFromPayload(payload, ctx);
            if (claimVal === void 0) {
              return {
                isValid: false,
                reason: {
                  message: "value does not exist",
                  expectedToNotInclude: val,
                  actualValue: claimVal
                }
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
            const claimSet = new Set(claimVal);
            const isValid = val.some((v) => claimSet.has(v));
            return isValid ? { isValid } : {
              isValid,
              reason: {
                message: "wrong value",
                expectedToIncludeAtLeastOneOf: val,
                actualValue: claimVal
              }
            };
          }
        };
      },
      excludesAll: (val, maxAgeInSeconds = this.defaultMaxAgeInSeconds, id) => {
        return {
          claim: this,
          id: id != null ? id : this.key,
          shouldRefetch: (payload, ctx) => this.getValueFromPayload(payload, ctx) === void 0 || // We know payload[this.id] is defined since the value is not undefined in this branch
          maxAgeInSeconds !== void 0 && payload[this.key].t < Date.now() - maxAgeInSeconds * 1e3,
          validate: async (payload, ctx) => {
            const claimVal = this.getValueFromPayload(payload, ctx);
            if (claimVal === void 0) {
              return {
                isValid: false,
                reason: {
                  message: "value does not exist",
                  expectedToNotInclude: val,
                  actualValue: claimVal
                }
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
            const claimSet = new Set(claimVal);
            const isValid = val.every((v) => !claimSet.has(v));
            return isValid ? { isValid } : {
              isValid,
              reason: { message: "wrong value", expectedToNotInclude: val, actualValue: claimVal }
            };
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
export {
  PrimitiveArrayClaim
};
