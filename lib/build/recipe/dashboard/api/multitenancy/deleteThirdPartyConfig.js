import Multitenancy from "../../../multitenancy";
import MultitenancyRecipe from "../../../multitenancy/recipe";
import SuperTokensError from "../../../../error";
import { FactorIds } from "../../../multifactorauth";
export default async function deleteThirdPartyConfig(_, tenantId, options, userContext) {
    var _a;
    const thirdPartyId = options.req.getKeyValueFromQuery("thirdPartyId");
    if (typeof tenantId !== "string" || tenantId === "" || typeof thirdPartyId !== "string" || thirdPartyId === "") {
        throw new SuperTokensError({
            message: "Missing required parameter 'tenantId' or 'thirdPartyId'",
            type: SuperTokensError.BAD_INPUT_ERROR,
        });
    }
    const tenantRes = await Multitenancy.getTenant(tenantId, userContext);
    if (tenantRes === undefined) {
        return {
            status: "UNKNOWN_TENANT_ERROR",
        };
    }
    const thirdPartyIdsFromCore = tenantRes.thirdParty.providers.map((provider) => provider.thirdPartyId);
    if (thirdPartyIdsFromCore.length === 0) {
        // this means that the tenant was using the static list of providers, we need to add them all before deleting one
        const mtRecipe = MultitenancyRecipe.getInstance();
        const staticProviders = (_a = mtRecipe === null || mtRecipe === void 0 ? void 0 : mtRecipe.staticThirdPartyProviders) !== null && _a !== void 0 ? _a : [];
        let staticProviderIds = staticProviders.map((provider) => provider.config.thirdPartyId);
        for (const providerId of staticProviderIds) {
            await Multitenancy.createOrUpdateThirdPartyConfig(tenantId, {
                thirdPartyId: providerId,
            }, undefined, userContext);
            // delay after each provider to avoid rate limiting
            await new Promise((r) => setTimeout(r, 500)); // 500ms
        }
    }
    else if (thirdPartyIdsFromCore.length === 1 && thirdPartyIdsFromCore[0] === thirdPartyId) {
        if (tenantRes.firstFactors === undefined) {
            // add all static first factors except thirdparty
            await Multitenancy.createOrUpdateTenant(tenantId, {
                firstFactors: [
                    FactorIds.EMAILPASSWORD,
                    FactorIds.OTP_PHONE,
                    FactorIds.OTP_EMAIL,
                    FactorIds.LINK_PHONE,
                    FactorIds.LINK_EMAIL,
                ],
            });
        }
        else if (tenantRes.firstFactors.includes("thirdparty")) {
            // add all static first factors except thirdparty
            const newFirstFactors = tenantRes.firstFactors.filter((factor) => factor !== "thirdparty");
            await Multitenancy.createOrUpdateTenant(tenantId, {
                firstFactors: newFirstFactors,
            });
        }
    }
    return await Multitenancy.deleteThirdPartyConfig(tenantId, thirdPartyId, userContext);
}
