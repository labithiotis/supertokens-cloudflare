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
import UserMetadata from "../usermetadata";
import { MultiFactorAuthClaim } from "./multiFactorAuthClaim";
import { logDebugMessage } from "../../logger";
import { updateAndGetMFARelatedInfoInSession } from "./utils";
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
        id: MultiFactorAuthClaim.key,
        claim: MultiFactorAuthClaim,
        shouldRefetch: (payload) => {
          const value = MultiFactorAuthClaim.getValueFromPayload(payload);
          return value === void 0;
        },
        validate: async (payload) => {
          const claimVal = MultiFactorAuthClaim.getValueFromPayload(payload);
          if (!claimVal) {
            throw new Error("should never happen");
          }
          if (claimVal.v) {
            logDebugMessage(
              `assertAllowedToSetupFactorElseThrowInvalidClaimError ${input.factorId}: true because the session already satisfied auth reqs`
            );
            return { isValid: true };
          }
          const setOfUnsatisfiedFactors = MultiFactorAuthClaim.getNextSetOfUnsatisfiedFactors(
            claimVal.c,
            await input.mfaRequirementsForAuth
          );
          const factorsSetUpForUserRes = await input.factorsSetUpForUser;
          if (setOfUnsatisfiedFactors.factorIds.some((id) => factorsSetUpForUserRes.includes(id))) {
            logDebugMessage(
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
            logDebugMessage(
              `assertAllowedToSetupFactorElseThrowInvalidClaimError ${input.factorId}: false because user is trying to set up factor that is not in the next set of unsatisfied factors: ${setOfUnsatisfiedFactors.factorIds.join(
                ", "
              )}`
            );
            return {
              isValid: false,
              reason: "Not allowed to setup factor that is not in the next set of unsatisfied factors"
            };
          }
          logDebugMessage(
            `assertAllowedToSetupFactorElseThrowInvalidClaimError ${input.factorId}: true because the next set of unsatisfied factors is ${setOfUnsatisfiedFactors.factorIds.length === 0 ? "empty" : "cannot be completed otherwise"}`
          );
          return { isValid: true };
        }
      };
      await input.session.assertClaims([validator], input.userContext);
    },
    markFactorAsCompleteInSession: async function({ session, factorId, userContext }) {
      await updateAndGetMFARelatedInfoInSession({
        session,
        updatedFactorId: factorId,
        userContext
      });
    },
    getRequiredSecondaryFactorsForUser: async function({ userId, userContext }) {
      var _a, _b;
      const metadata = await UserMetadata.getUserMetadata(userId, userContext);
      return (_b = (_a = metadata.metadata._supertokens) == null ? void 0 : _a.requiredSecondaryFactors) != null ? _b : [];
    },
    addToRequiredSecondaryFactorsForUser: async function({ userId, factorId, userContext }) {
      var _a, _b;
      const metadata = await UserMetadata.getUserMetadata(userId, userContext);
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
      await UserMetadata.updateUserMetadata(userId, metadataUpdate, userContext);
    },
    removeFromRequiredSecondaryFactorsForUser: async function({ userId, factorId, userContext }) {
      var _a, _b;
      const metadata = await UserMetadata.getUserMetadata(userId, userContext);
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
      await UserMetadata.updateUserMetadata(userId, metadataUpdate, userContext);
    }
  };
}
export {
  getRecipeInterface as default
};
