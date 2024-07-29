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
var import_usermetadata = __toESM(require("../usermetadata"), 1);
var import_multiFactorAuthClaim = require("./multiFactorAuthClaim");
var import_logger = require("../../logger");
var import_utils = require("./utils");
function getRecipeInterface(recipeInstance) {
  return {
    getFactorsSetupForUser: async function({ user, userContext }) {
      let factorIds = [];
      for (const func of recipeInstance.getFactorsSetupForUserFromOtherRecipesFuncs) {
        let result = await func(user, userContext);
        if (result !== void 0) {
          for (const factorId of result) {
            if (!factorIds.includes(factorId)) {
              factorIds.push(factorId);
            }
          }
        }
      }
      return factorIds;
    },
    getMFARequirementsForAuth: async function({
      requiredSecondaryFactorsForUser,
      requiredSecondaryFactorsForTenant
    }) {
      const allFactors = /* @__PURE__ */ new Set();
      for (const factor of await requiredSecondaryFactorsForUser) {
        allFactors.add(factor);
      }
      for (const factor of await requiredSecondaryFactorsForTenant) {
        allFactors.add(factor);
      }
      return [{ oneOf: [...allFactors] }];
    },
    assertAllowedToSetupFactorElseThrowInvalidClaimError: async function(input) {
      const validator = {
        id: import_multiFactorAuthClaim.MultiFactorAuthClaim.key,
        claim: import_multiFactorAuthClaim.MultiFactorAuthClaim,
        shouldRefetch: (payload) => {
          const value = import_multiFactorAuthClaim.MultiFactorAuthClaim.getValueFromPayload(payload);
          return value === void 0;
        },
        validate: async (payload) => {
          const claimVal = import_multiFactorAuthClaim.MultiFactorAuthClaim.getValueFromPayload(payload);
          if (!claimVal) {
            throw new Error("should never happen");
          }
          if (claimVal.v) {
            (0, import_logger.logDebugMessage)(
              `assertAllowedToSetupFactorElseThrowInvalidClaimError ${input.factorId}: true because the session already satisfied auth reqs`
            );
            return { isValid: true };
          }
          const setOfUnsatisfiedFactors = import_multiFactorAuthClaim.MultiFactorAuthClaim.getNextSetOfUnsatisfiedFactors(
            claimVal.c,
            await input.mfaRequirementsForAuth
          );
          const factorsSetUpForUserRes = await input.factorsSetUpForUser;
          if (setOfUnsatisfiedFactors.factorIds.some((id) => factorsSetUpForUserRes.includes(id))) {
            (0, import_logger.logDebugMessage)(
              `assertAllowedToSetupFactorElseThrowInvalidClaimError ${input.factorId}: false because there are items already set up in the next set of unsatisfied factors: ${setOfUnsatisfiedFactors.factorIds.join(
                ", "
              )}`
            );
            return {
              isValid: false,
              reason: "Completed factors in the session does not satisfy the MFA requirements for auth"
            };
          }
          if (setOfUnsatisfiedFactors.factorIds.length > 0 && !setOfUnsatisfiedFactors.factorIds.includes(input.factorId)) {
            (0, import_logger.logDebugMessage)(
              `assertAllowedToSetupFactorElseThrowInvalidClaimError ${input.factorId}: false because user is trying to set up factor that is not in the next set of unsatisfied factors: ${setOfUnsatisfiedFactors.factorIds.join(
                ", "
              )}`
            );
            return {
              isValid: false,
              reason: "Not allowed to setup factor that is not in the next set of unsatisfied factors"
            };
          }
          (0, import_logger.logDebugMessage)(
            `assertAllowedToSetupFactorElseThrowInvalidClaimError ${input.factorId}: true because the next set of unsatisfied factors is ${setOfUnsatisfiedFactors.factorIds.length === 0 ? "empty" : "cannot be completed otherwise"}`
          );
          return { isValid: true };
        }
      };
      await input.session.assertClaims([validator], input.userContext);
    },
    markFactorAsCompleteInSession: async function({ session, factorId, userContext }) {
      await (0, import_utils.updateAndGetMFARelatedInfoInSession)({
        session,
        updatedFactorId: factorId,
        userContext
      });
    },
    getRequiredSecondaryFactorsForUser: async function({ userId, userContext }) {
      var _a, _b;
      const metadata = await import_usermetadata.default.getUserMetadata(userId, userContext);
      return (_b = (_a = metadata.metadata._supertokens) == null ? void 0 : _a.requiredSecondaryFactors) != null ? _b : [];
    },
    addToRequiredSecondaryFactorsForUser: async function({ userId, factorId, userContext }) {
      var _a, _b;
      const metadata = await import_usermetadata.default.getUserMetadata(userId, userContext);
      const factorIds = (_b = (_a = metadata.metadata._supertokens) == null ? void 0 : _a.requiredSecondaryFactors) != null ? _b : [];
      if (factorIds.includes(factorId)) {
        return;
      }
      factorIds.push(factorId);
      const metadataUpdate = __spreadProps(__spreadValues({}, metadata.metadata), {
        _supertokens: __spreadProps(__spreadValues({}, metadata.metadata._supertokens), {
          requiredSecondaryFactors: factorIds
        })
      });
      await import_usermetadata.default.updateUserMetadata(userId, metadataUpdate, userContext);
    },
    removeFromRequiredSecondaryFactorsForUser: async function({ userId, factorId, userContext }) {
      var _a, _b;
      const metadata = await import_usermetadata.default.getUserMetadata(userId, userContext);
      if (((_a = metadata.metadata._supertokens) == null ? void 0 : _a.requiredSecondaryFactors) === void 0) {
        return;
      }
      let factorIds = (_b = metadata.metadata._supertokens.requiredSecondaryFactors) != null ? _b : [];
      if (!factorIds.includes(factorId)) {
        return;
      }
      factorIds = factorIds.filter((id) => id !== factorId);
      const metadataUpdate = __spreadProps(__spreadValues({}, metadata.metadata), {
        _supertokens: __spreadProps(__spreadValues({}, metadata.metadata._supertokens), {
          requiredSecondaryFactors: factorIds
        })
      });
      await import_usermetadata.default.updateUserMetadata(userId, metadataUpdate, userContext);
    }
  };
}
