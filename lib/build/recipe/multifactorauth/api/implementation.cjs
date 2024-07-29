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
var import_multiFactorAuthClaim = require("../multiFactorAuthClaim");
var import_error = __toESM(require("../../session/error"), 1);
var import_utils = require("../utils");
var import_multitenancy = __toESM(require("../../multitenancy"), 1);
var import__ = require("../../..");
function getAPIInterface() {
  return {
    resyncSessionAndFetchMFAInfoPUT: async ({ options, session, userContext }) => {
      const sessionUser = await (0, import__.getUser)(session.getUserId(), userContext);
      if (sessionUser === void 0) {
        throw new import_error.default({
          type: import_error.default.UNAUTHORISED,
          message: "Session user not found"
        });
      }
      const mfaInfo = await (0, import_utils.updateAndGetMFARelatedInfoInSession)({
        session,
        userContext
      });
      const factorsSetUpForUser = await options.recipeImplementation.getFactorsSetupForUser({
        user: sessionUser,
        userContext
      });
      const tenantInfo = await import_multitenancy.default.getTenant(session.getTenantId(userContext), userContext);
      if (tenantInfo === void 0) {
        throw new import_error.default({
          type: import_error.default.UNAUTHORISED,
          message: "Tenant not found"
        });
      }
      const allAvailableSecondaryFactors = options.recipeInstance.getAllAvailableSecondaryFactorIds(tenantInfo);
      const factorsAllowedToSetup = [];
      for (const id of allAvailableSecondaryFactors) {
        try {
          await options.recipeImplementation.assertAllowedToSetupFactorElseThrowInvalidClaimError({
            session,
            factorId: id,
            get factorsSetUpForUser() {
              return Promise.resolve(factorsSetUpForUser);
            },
            get mfaRequirementsForAuth() {
              return Promise.resolve(mfaInfo.mfaRequirementsForAuth);
            },
            userContext
          });
          factorsAllowedToSetup.push(id);
        } catch (err) {
          if (!(import_error.default.isErrorFromSuperTokens(err) && err.type === import_error.default.INVALID_CLAIMS)) {
            throw err;
          }
        }
      }
      const nextSetOfUnsatisfiedFactors = import_multiFactorAuthClaim.MultiFactorAuthClaim.getNextSetOfUnsatisfiedFactors(
        mfaInfo.completedFactors,
        mfaInfo.mfaRequirementsForAuth
      );
      let getEmailsForFactorsResult = options.recipeInstance.getEmailsForFactors(
        sessionUser,
        session.getRecipeUserId(userContext)
      );
      let getPhoneNumbersForFactorsResult = options.recipeInstance.getPhoneNumbersForFactors(
        sessionUser,
        session.getRecipeUserId(userContext)
      );
      if (getEmailsForFactorsResult.status === "UNKNOWN_SESSION_RECIPE_USER_ID" || getPhoneNumbersForFactorsResult.status === "UNKNOWN_SESSION_RECIPE_USER_ID") {
        throw new import_error.default({
          type: "UNAUTHORISED",
          message: "User no longer associated with the session"
        });
      }
      const next = nextSetOfUnsatisfiedFactors.factorIds.filter(
        (factorId) => factorsAllowedToSetup.includes(factorId) || factorsSetUpForUser.includes(factorId)
      );
      if (next.length === 0 && nextSetOfUnsatisfiedFactors.factorIds.length !== 0) {
        throw new Error(
          `The user is required to complete secondary factors they are not allowed to (${nextSetOfUnsatisfiedFactors.factorIds.join(
            ", "
          )}), likely because of configuration issues.`
        );
      }
      return {
        status: "OK",
        factors: {
          next,
          alreadySetup: factorsSetUpForUser,
          allowedToSetup: factorsAllowedToSetup
        },
        emails: getEmailsForFactorsResult.factorIdToEmailsMap,
        phoneNumbers: getPhoneNumbersForFactorsResult.factorIdToPhoneNumberMap
      };
    }
  };
}
