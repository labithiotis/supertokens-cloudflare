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
var multifactorauth_exports = {};
__export(multifactorauth_exports, {
  FactorIds: () => import_types.FactorIds,
  MultiFactorAuthClaim: () => import_multiFactorAuthClaim.MultiFactorAuthClaim,
  addToRequiredSecondaryFactorsForUser: () => addToRequiredSecondaryFactorsForUser,
  assertAllowedToSetupFactorElseThrowInvalidClaimError: () => assertAllowedToSetupFactorElseThrowInvalidClaimError,
  default: () => Wrapper,
  getFactorsSetupForUser: () => getFactorsSetupForUser,
  getMFARequirementsForAuth: () => getMFARequirementsForAuth,
  getRequiredSecondaryFactorsForUser: () => getRequiredSecondaryFactorsForUser,
  init: () => init,
  markFactorAsCompleteInSession: () => markFactorAsCompleteInSession,
  removeFromRequiredSecondaryFactorsForUser: () => removeFromRequiredSecondaryFactorsForUser
});
module.exports = __toCommonJS(multifactorauth_exports);
var import_recipe = __toESM(require("./recipe"), 1);
var import_multiFactorAuthClaim = require("./multiFactorAuthClaim");
var import__ = require("../..");
var import_utils = require("../../utils");
var import_utils2 = require("./utils");
var import_types = require("./types");
const _Wrapper = class _Wrapper {
  static async assertAllowedToSetupFactorElseThrowInvalidClaimError(session, factorId, userContext) {
    let ctx = (0, import_utils.getUserContext)(userContext);
    const mfaInfo = await (0, import_utils2.updateAndGetMFARelatedInfoInSession)({
      session,
      userContext: ctx
    });
    const factorsSetUpForUser = await _Wrapper.getFactorsSetupForUser(session.getUserId(), ctx);
    await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.assertAllowedToSetupFactorElseThrowInvalidClaimError(
      {
        session,
        factorId,
        get factorsSetUpForUser() {
          return Promise.resolve(factorsSetUpForUser);
        },
        get mfaRequirementsForAuth() {
          return Promise.resolve(mfaInfo.mfaRequirementsForAuth);
        },
        userContext: ctx
      }
    );
  }
  static async getMFARequirementsForAuth(session, userContext) {
    let ctx = (0, import_utils.getUserContext)(userContext);
    const mfaInfo = await (0, import_utils2.updateAndGetMFARelatedInfoInSession)({
      session,
      userContext: ctx
    });
    return mfaInfo.mfaRequirementsForAuth;
  }
  static async markFactorAsCompleteInSession(session, factorId, userContext) {
    await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.markFactorAsCompleteInSession({
      session,
      factorId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async getFactorsSetupForUser(userId, userContext) {
    const ctx = (0, import_utils.getUserContext)(userContext);
    const user = await (0, import__.getUser)(userId, ctx);
    if (!user) {
      throw new Error("Unknown user id");
    }
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.getFactorsSetupForUser({
      user,
      userContext: ctx
    });
  }
  static async getRequiredSecondaryFactorsForUser(userId, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.getRequiredSecondaryFactorsForUser({
      userId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async addToRequiredSecondaryFactorsForUser(userId, factorId, userContext) {
    await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.addToRequiredSecondaryFactorsForUser({
      userId,
      factorId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async removeFromRequiredSecondaryFactorsForUser(userId, factorId, userContext) {
    await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.removeFromRequiredSecondaryFactorsForUser({
      userId,
      factorId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
};
_Wrapper.init = import_recipe.default.init;
_Wrapper.MultiFactorAuthClaim = import_multiFactorAuthClaim.MultiFactorAuthClaim;
_Wrapper.FactorIds = import_types.FactorIds;
let Wrapper = _Wrapper;
let init = Wrapper.init;
let assertAllowedToSetupFactorElseThrowInvalidClaimError = Wrapper.assertAllowedToSetupFactorElseThrowInvalidClaimError;
let markFactorAsCompleteInSession = Wrapper.markFactorAsCompleteInSession;
let getFactorsSetupForUser = Wrapper.getFactorsSetupForUser;
let getRequiredSecondaryFactorsForUser = Wrapper.getRequiredSecondaryFactorsForUser;
let getMFARequirementsForAuth = Wrapper.getMFARequirementsForAuth;
const addToRequiredSecondaryFactorsForUser = Wrapper.addToRequiredSecondaryFactorsForUser;
const removeFromRequiredSecondaryFactorsForUser = Wrapper.removeFromRequiredSecondaryFactorsForUser;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FactorIds,
  MultiFactorAuthClaim,
  addToRequiredSecondaryFactorsForUser,
  assertAllowedToSetupFactorElseThrowInvalidClaimError,
  getFactorsSetupForUser,
  getMFARequirementsForAuth,
  getRequiredSecondaryFactorsForUser,
  init,
  markFactorAsCompleteInSession,
  removeFromRequiredSecondaryFactorsForUser
});
