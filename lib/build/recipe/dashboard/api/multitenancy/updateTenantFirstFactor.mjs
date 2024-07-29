import MultitenancyRecipe from "../../../multitenancy/recipe";
import { getFactorNotAvailableMessage, getNormalisedFirstFactorsBasedOnTenantConfigFromCoreAndSDKInit } from "./utils";
async function updateTenantFirstFactor(_, tenantId, options, userContext) {
  const requestBody = await options.req.getJSONBody();
  const { factorId, enable } = requestBody;
  const mtRecipe = MultitenancyRecipe.getInstance();
  if (enable === true) {
    if (!(mtRecipe == null ? void 0 : mtRecipe.allAvailableFirstFactors.includes(factorId))) {
      return {
        status: "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK_ERROR",
        message: getFactorNotAvailableMessage(factorId, mtRecipe.allAvailableFirstFactors)
      };
    }
  }
  const tenantRes = await (mtRecipe == null ? void 0 : mtRecipe.recipeInterfaceImpl.getTenant({ tenantId, userContext }));
  if (tenantRes === void 0) {
    return {
      status: "UNKNOWN_TENANT_ERROR"
    };
  }
  let firstFactors = getNormalisedFirstFactorsBasedOnTenantConfigFromCoreAndSDKInit(tenantRes);
  if (enable === true) {
    if (!firstFactors.includes(factorId)) {
      firstFactors.push(factorId);
    }
  } else {
    firstFactors = firstFactors.filter((f) => f !== factorId);
  }
  await (mtRecipe == null ? void 0 : mtRecipe.recipeInterfaceImpl.createOrUpdateTenant({
    tenantId,
    config: {
      firstFactors
    },
    userContext
  }));
  return {
    status: "OK"
  };
}
export {
  updateTenantFirstFactor as default
};
