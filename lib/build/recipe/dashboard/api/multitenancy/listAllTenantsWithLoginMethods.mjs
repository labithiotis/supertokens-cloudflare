import MultitenancyRecipe from "../../../multitenancy/recipe";
import { getNormalisedFirstFactorsBasedOnTenantConfigFromCoreAndSDKInit } from "./utils";
async function listAllTenantsWithLoginMethods(_, __, ___, userContext) {
  const tenantsRes = await MultitenancyRecipe.getInstanceOrThrowError().recipeInterfaceImpl.listAllTenants({
    userContext
  });
  const finalTenants = [];
  for (let i = 0; i < tenantsRes.tenants.length; i++) {
    const currentTenant = tenantsRes.tenants[i];
    const loginMethods = getNormalisedFirstFactorsBasedOnTenantConfigFromCoreAndSDKInit(currentTenant);
    finalTenants.push({
      tenantId: currentTenant.tenantId,
      firstFactors: loginMethods
    });
  }
  return {
    status: "OK",
    tenants: finalTenants
  };
}
export {
  listAllTenantsWithLoginMethods as default
};
