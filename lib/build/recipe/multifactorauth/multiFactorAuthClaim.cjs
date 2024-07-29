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
var multiFactorAuthClaim_exports = {};
__export(multiFactorAuthClaim_exports, {
  MultiFactorAuthClaim: () => MultiFactorAuthClaim,
  MultiFactorAuthClaimClass: () => MultiFactorAuthClaimClass
});
module.exports = __toCommonJS(multiFactorAuthClaim_exports);
var import_claims = require("../session/claims");
var import_utils = require("./utils");
class MultiFactorAuthClaimClass extends import_claims.SessionClaim {
  constructor(key) {
    super(key != null ? key : "st-mfa");
    this.fetchValue = async (_userId, recipeUserId, tenantId, currentPayload, userContext) => {
      const mfaInfo = await (0, import_utils.updateAndGetMFARelatedInfoInSession)({
        sessionRecipeUserId: recipeUserId,
        tenantId,
        accessTokenPayload: currentPayload,
        userContext
      });
      let { completedFactors, isMFARequirementsForAuthSatisfied } = mfaInfo;
      return {
        c: completedFactors,
        v: isMFARequirementsForAuthSatisfied
      };
    };
    this.addToPayload_internal = (payload, value) => {
      const prevValue = payload[this.key];
      return __spreadProps(__spreadValues({}, payload), {
        [this.key]: {
          c: __spreadValues(__spreadValues({}, prevValue == null ? void 0 : prevValue.c), value.c),
          v: value.v
        }
      });
    };
    this.removeFromPayload = (payload) => {
      const retVal = __spreadValues({}, payload);
      delete retVal[this.key];
      return retVal;
    };
    this.removeFromPayloadByMerge_internal = () => {
      return {
        [this.key]: null
      };
    };
    this.getValueFromPayload = (payload) => {
      return payload[this.key];
    };
    this.validators = {
      hasCompletedMFARequirementsForAuth: (claimKey) => ({
        claim: this,
        id: claimKey != null ? claimKey : this.key,
        shouldRefetch: (payload) => {
          const value = this.getValueFromPayload(payload);
          return value === void 0;
        },
        validate: async (payload) => {
          const claimVal = this.getValueFromPayload(payload);
          if (claimVal === void 0) {
            throw new Error("This should never happen, claim value not present in payload");
          }
          const { v } = claimVal;
          return {
            isValid: v,
            reason: v === false ? {
              message: "MFA requirement for auth is not satisfied"
            } : void 0
          };
        }
      }),
      hasCompletedRequirementList: (requirementList, claimKey) => ({
        claim: this,
        id: claimKey != null ? claimKey : this.key,
        shouldRefetch: (payload) => {
          const value = this.getValueFromPayload(payload);
          return value === void 0;
        },
        validate: async (payload) => {
          if (requirementList.length === 0) {
            return {
              isValid: true
              // No requirements to satisfy
            };
          }
          const claimVal = this.getValueFromPayload(payload);
          if (claimVal === void 0) {
            throw new Error("This should never happen, claim value not present in payload");
          }
          const { c: completedFactors } = claimVal;
          const nextSetOfUnsatisfiedFactors = this.getNextSetOfUnsatisfiedFactors(
            completedFactors,
            requirementList
          );
          if (nextSetOfUnsatisfiedFactors.factorIds.length === 0) {
            return {
              isValid: true
            };
          }
          if (nextSetOfUnsatisfiedFactors.type === "string") {
            return {
              isValid: false,
              reason: {
                message: "Factor validation failed: " + nextSetOfUnsatisfiedFactors.factorIds[0] + " not completed",
                factorId: nextSetOfUnsatisfiedFactors.factorIds[0]
              }
            };
          } else if (nextSetOfUnsatisfiedFactors.type === "oneOf") {
            return {
              isValid: false,
              reason: {
                message: "None of these factors are complete in the session: " + nextSetOfUnsatisfiedFactors.factorIds.join(", "),
                oneOf: nextSetOfUnsatisfiedFactors.factorIds
              }
            };
          } else {
            return {
              isValid: false,
              reason: {
                message: "Some of the factors are not complete in the session: " + nextSetOfUnsatisfiedFactors.factorIds.join(", "),
                allOfInAnyOrder: nextSetOfUnsatisfiedFactors.factorIds
              }
            };
          }
        }
      })
    };
  }
  getNextSetOfUnsatisfiedFactors(completedFactors, requirementList) {
    for (const req of requirementList) {
      const nextFactors = /* @__PURE__ */ new Set();
      let type = "string";
      if (typeof req === "string") {
        if (completedFactors[req] === void 0) {
          type = "string";
          nextFactors.add(req);
        }
      } else if ("oneOf" in req) {
        let satisfied = false;
        for (const factorId of req.oneOf) {
          if (completedFactors[factorId] !== void 0) {
            satisfied = true;
          }
        }
        if (!satisfied) {
          type = "oneOf";
          for (const factorId of req.oneOf) {
            nextFactors.add(factorId);
          }
        }
      } else if ("allOfInAnyOrder" in req) {
        for (const factorId of req.allOfInAnyOrder) {
          type = "allOfInAnyOrder";
          if (completedFactors[factorId] === void 0) {
            nextFactors.add(factorId);
          }
        }
      }
      if (nextFactors.size > 0) {
        return {
          factorIds: Array.from(nextFactors),
          type
        };
      }
    }
    return {
      factorIds: [],
      type: "string"
    };
  }
}
const MultiFactorAuthClaim = new MultiFactorAuthClaimClass();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MultiFactorAuthClaim,
  MultiFactorAuthClaimClass
});
