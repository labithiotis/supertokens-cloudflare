import Multitenancy from "../../../multitenancy";
import MultitenancyRecipe from "../../../multitenancy/recipe";
import SuperTokensError from "../../../../error";
import { FactorIds } from "../../../multifactorauth";
async function deleteThirdPartyConfig(_, tenantId, options, userContext) {
  var _a;
  const thirdPartyId = options.req.getKeyValueFromQuery("thirdPartyId");
  if (typeof tenantId !== "string" || tenantId === "" || typeof thirdPartyId !== "string" || thirdPartyId === "") {
    throw new SuperTokensError({
      message: "Missing required parameter 'tenantId' or 'thirdPartyId'",
      type: SuperTokensError.BAD_INPUT_ERROR
    });
  }
  const tenantRes = await Multitenancy.getTenant(tenantId, userContext);
  if (tenantRes === void 0) {
    return {
      status: "UNKNOWN_TENANT_ERROR"
    };
  }
  const thirdPartyIdsFromCore = tenantRes.thirdParty.providers.map((provider) => provider.thirdPartyId);
  if (thirdPartyIdsFromCore.length === 0) {
    const mtRecipe = MultitenancyRecipe.getInstance();
    const staticProviders = (_a = mtRecipe == null ? void 0 : mtRecipe.staticThirdPartyProviders) != null ? _a : [];
    let staticProviderIds = staticProviders.map((provider) => provider.config.thirdPartyId);
    for (const providerId of staticProviderIds) {
      await Multitenancy.createOrUpdateThirdPartyConfig(
        tenantId,
        {
          thirdPartyId: providerId
        },
        void 0,
        userContext
      );
      await new Promise((r) => setTimeout(r, 500));
    }
  } else if (thirdPartyIdsFromCore.length === 1 && thirdPartyIdsFromCore[0] === thirdPartyId) {
    if (tenantRes.firstFactors === void 0) {
      await Multitenancy.createOrUpdateTenant(tenantId, {
        firstFactors: [
          FactorIds.EMAILPASSWORD,
          FactorIds.OTP_PHONE,
          FactorIds.OTP_EMAIL,
          FactorIds.LINK_PHONE,
          FactorIds.LINK_EMAIL
        ]
      });
    } else if (tenantRes.firstFactors.includes("thirdparty")) {
      const newFirstFactors = tenantRes.firstFactors.filter((factor) => factor !== "thirdparty");
      await Multitenancy.createOrUpdateTenant(tenantId, {
        firstFactors: newFirstFactors
      });
    }
  }
  return await Multitenancy.deleteThirdPartyConfig(tenantId, thirdPartyId, userContext);
}
export {
  deleteThirdPartyConfig as default
};
