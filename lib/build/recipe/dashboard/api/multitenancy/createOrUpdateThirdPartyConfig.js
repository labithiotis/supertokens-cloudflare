import Multitenancy from "../../../multitenancy";
import MultitenancyRecipe from "../../../multitenancy/recipe";
export default async function createOrUpdateThirdPartyConfig(_, tenantId, options, userContext) {
    var _a;
    const requestBody = await options.req.getJSONBody();
    const { providerConfig } = requestBody;
    let tenantRes = await Multitenancy.getTenant(tenantId, userContext);
    if (tenantRes === undefined) {
        return {
            status: "UNKNOWN_TENANT_ERROR",
        };
    }
    if (tenantRes.thirdParty.providers.length === 0) {
        // This means that the tenant was using the static list of providers, we need to add them all before adding the new one
        const mtRecipe = MultitenancyRecipe.getInstance();
        const staticProviders =
            (_a = mtRecipe === null || mtRecipe === void 0 ? void 0 : mtRecipe.staticThirdPartyProviders) !== null &&
            _a !== void 0
                ? _a
                : [];
        for (const provider of staticProviders) {
            await Multitenancy.createOrUpdateThirdPartyConfig(
                tenantId,
                {
                    thirdPartyId: provider.config.thirdPartyId,
                },
                undefined,
                userContext
            );
            // delay after each provider to avoid rate limiting
            await new Promise((r) => setTimeout(r, 500)); // 500ms
        }
    }
    const thirdPartyRes = await Multitenancy.createOrUpdateThirdPartyConfig(
        tenantId,
        providerConfig,
        undefined,
        userContext
    );
    return thirdPartyRes;
}
