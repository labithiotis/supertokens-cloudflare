import Recipe from "./recipe";
import { MultiFactorAuthClaim } from "./multiFactorAuthClaim";
import { getUser } from "../..";
import { getUserContext } from "../../utils";
import { updateAndGetMFARelatedInfoInSession } from "./utils";
import { FactorIds } from "./types";
const _Wrapper = class _Wrapper {
  static async assertAllowedToSetupFactorElseThrowInvalidClaimError(session, factorId, userContext) {
    let ctx = getUserContext(userContext);
    const mfaInfo = await updateAndGetMFARelatedInfoInSession({
      session,
      userContext: ctx
    });
    const factorsSetUpForUser = await _Wrapper.getFactorsSetupForUser(session.getUserId(), ctx);
    await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.assertAllowedToSetupFactorElseThrowInvalidClaimError(
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
    let ctx = getUserContext(userContext);
    const mfaInfo = await updateAndGetMFARelatedInfoInSession({
      session,
      userContext: ctx
    });
    return mfaInfo.mfaRequirementsForAuth;
  }
  static async markFactorAsCompleteInSession(session, factorId, userContext) {
    await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.markFactorAsCompleteInSession({
      session,
      factorId,
      userContext: getUserContext(userContext)
    });
  }
  static async getFactorsSetupForUser(userId, userContext) {
    const ctx = getUserContext(userContext);
    const user = await getUser(userId, ctx);
    if (!user) {
      throw new Error("Unknown user id");
    }
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getFactorsSetupForUser({
      user,
      userContext: ctx
    });
  }
  static async getRequiredSecondaryFactorsForUser(userId, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getRequiredSecondaryFactorsForUser({
      userId,
      userContext: getUserContext(userContext)
    });
  }
  static async addToRequiredSecondaryFactorsForUser(userId, factorId, userContext) {
    await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.addToRequiredSecondaryFactorsForUser({
      userId,
      factorId,
      userContext: getUserContext(userContext)
    });
  }
  static async removeFromRequiredSecondaryFactorsForUser(userId, factorId, userContext) {
    await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.removeFromRequiredSecondaryFactorsForUser({
      userId,
      factorId,
      userContext: getUserContext(userContext)
    });
  }
};
_Wrapper.init = Recipe.init;
_Wrapper.MultiFactorAuthClaim = MultiFactorAuthClaim;
_Wrapper.FactorIds = FactorIds;
let Wrapper = _Wrapper;
let init = Wrapper.init;
let assertAllowedToSetupFactorElseThrowInvalidClaimError = Wrapper.assertAllowedToSetupFactorElseThrowInvalidClaimError;
let markFactorAsCompleteInSession = Wrapper.markFactorAsCompleteInSession;
let getFactorsSetupForUser = Wrapper.getFactorsSetupForUser;
let getRequiredSecondaryFactorsForUser = Wrapper.getRequiredSecondaryFactorsForUser;
let getMFARequirementsForAuth = Wrapper.getMFARequirementsForAuth;
const addToRequiredSecondaryFactorsForUser = Wrapper.addToRequiredSecondaryFactorsForUser;
const removeFromRequiredSecondaryFactorsForUser = Wrapper.removeFromRequiredSecondaryFactorsForUser;
export {
  FactorIds,
  MultiFactorAuthClaim,
  addToRequiredSecondaryFactorsForUser,
  assertAllowedToSetupFactorElseThrowInvalidClaimError,
  Wrapper as default,
  getFactorsSetupForUser,
  getMFARequirementsForAuth,
  getRequiredSecondaryFactorsForUser,
  init,
  markFactorAsCompleteInSession,
  removeFromRequiredSecondaryFactorsForUser
};
