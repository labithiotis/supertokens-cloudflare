import MultitenancyRecipe from "../../../multitenancy/recipe";
import MultifactorAuthRecipe from "../../../multifactorauth/recipe";
import {
  getFactorNotAvailableMessage,
  getNormalisedRequiredSecondaryFactorsBasedOnTenantConfigFromCoreAndSDKInit
} from "./utils";
async function updateTenantSecondaryFactor(_, tenantId, options, userContext) {
  const requestBody = await options.req.getJSONBody();
  const { factorId, enable } = requestBody;
  const mtRecipe = MultitenancyRecipe.getInstance();
  const mfaInstance = MultifactorAuthRecipe.getInstance();
  if (mfaInstance === void 0) {
    return {
      status: "MFA_NOT_INITIALIZED_ERROR"
    };
  }
  const tenantRes = await (mtRecipe == null ? void 0 : mtRecipe.recipeInterfaceImpl.getTenant({ tenantId, userContext }));
  if (tenantRes === void 0) {
    return {
      status: "UNKNOWN_TENANT_ERROR"
    };
  }
  if (enable === true) {
    const allAvailableSecondaryFactors = mfaInstance.getAllAvailableSecondaryFactorIds(tenantRes);
    if (!allAvailableSecondaryFactors.includes(factorId)) {
      return {
        status: "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK_ERROR",
        message: getFactorNotAvailableMessage(factorId, allAvailableSecondaryFactors)
      };
    }
  }
  let secondaryFactors = getNormalisedRequiredSecondaryFactorsBasedOnTenantConfigFromCoreAndSDKInit(tenantRes);
  if (enable === true) {
    if (!secondaryFactors.includes(factorId)) {
      secondaryFactors.push(factorId);
    }
  } else {
    secondaryFactors = secondaryFactors.filter((f) => f !== factorId);
  }
  await (mtRecipe == null ? void 0 : mtRecipe.recipeInterfaceImpl.createOrUpdateTenant({
    tenantId,
    config: {
      requiredSecondaryFactors: secondaryFactors.length > 0 ? secondaryFactors : null
    },
    userContext
  }));
  return {
    status: "OK",
    isMFARequirementsForAuthOverridden: mfaInstance.isGetMfaRequirementsForAuthOverridden
  };
}
export {
  updateTenantSecondaryFactor as default
};
