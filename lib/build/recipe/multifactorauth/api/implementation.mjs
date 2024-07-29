import { MultiFactorAuthClaim } from "../multiFactorAuthClaim";
import SessionError from "../../session/error";
import { updateAndGetMFARelatedInfoInSession } from "../utils";
import Multitenancy from "../../multitenancy";
import { getUser } from "../../..";
function getAPIInterface() {
  return {
    resyncSessionAndFetchMFAInfoPUT: async ({ options, session, userContext }) => {
      const sessionUser = await getUser(session.getUserId(), userContext);
      if (sessionUser === void 0) {
        throw new SessionError({
          type: SessionError.UNAUTHORISED,
          message: "Session user not found"
        });
      }
      const mfaInfo = await updateAndGetMFARelatedInfoInSession({
        session,
        userContext
      });
      const factorsSetUpForUser = await options.recipeImplementation.getFactorsSetupForUser({
        user: sessionUser,
        userContext
      });
      const tenantInfo = await Multitenancy.getTenant(session.getTenantId(userContext), userContext);
      if (tenantInfo === void 0) {
        throw new SessionError({
          type: SessionError.UNAUTHORISED,
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
          if (!(SessionError.isErrorFromSuperTokens(err) && err.type === SessionError.INVALID_CLAIMS)) {
            throw err;
          }
        }
      }
      const nextSetOfUnsatisfiedFactors = MultiFactorAuthClaim.getNextSetOfUnsatisfiedFactors(
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
        throw new SessionError({
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
export {
  getAPIInterface as default
};
