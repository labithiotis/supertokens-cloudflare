import Multitenancy from "../../../multitenancy";
import MultitenancyRecipe from "../../../multitenancy/recipe";
import NormalisedURLDomain from "../../../../normalisedURLDomain";
import NormalisedURLPath from "../../../../normalisedURLPath";
import { doPostRequest } from "../../../thirdparty/providers/utils";
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
        const staticProviders = (_a = mtRecipe === null || mtRecipe === void 0 ? void 0 : mtRecipe.staticThirdPartyProviders) !== null && _a !== void 0 ? _a : [];
        for (const provider of staticProviders.filter((provider) => provider.includeInNonPublicTenantsByDefault === true)) {
            await Multitenancy.createOrUpdateThirdPartyConfig(tenantId, {
                thirdPartyId: provider.config.thirdPartyId,
            }, undefined, userContext);
            // delay after each provider to avoid rate limiting
            await new Promise((r) => setTimeout(r, 500)); // 500ms
        }
    }
    if (providerConfig.thirdPartyId.startsWith("boxy-saml")) {
        const boxyURL = providerConfig.clients[0].additionalConfig.boxyURL;
        const boxyAPIKey = providerConfig.clients[0].additionalConfig.boxyAPIKey;
        providerConfig.clients[0].additionalConfig.boxyAPIKey = undefined;
        if (boxyAPIKey &&
            (providerConfig.clients[0].additionalConfig.samlInputType === "xml" ||
                providerConfig.clients[0].additionalConfig.samlInputType === "url")) {
            const requestBody = {
                name: "",
                label: "",
                description: "",
                tenant: providerConfig.clients[0].additionalConfig.boxyTenant ||
                    `${tenantId}-${providerConfig.thirdPartyId}`,
                product: providerConfig.clients[0].additionalConfig.boxyProduct || "supertokens",
                defaultRedirectUrl: providerConfig.clients[0].additionalConfig.redirectURLs[0],
                forceAuthn: false,
                encodedRawMetadata: providerConfig.clients[0].additionalConfig.samlXML
                    ? Buffer.from(providerConfig.clients[0].additionalConfig.samlXML).toString("base64")
                    : "",
                redirectUrl: JSON.stringify(providerConfig.clients[0].additionalConfig.redirectURLs),
                metadataUrl: providerConfig.clients[0].additionalConfig.samlURL || "",
            };
            const normalisedDomain = new NormalisedURLDomain(boxyURL);
            const normalisedBasePath = new NormalisedURLPath(boxyURL);
            const connectionsPath = new NormalisedURLPath("/api/v1/saml/config");
            const resp = await doPostRequest(normalisedDomain.getAsStringDangerous() +
                normalisedBasePath.appendPath(connectionsPath).getAsStringDangerous(), requestBody, {
                Authorization: `Api-Key ${boxyAPIKey}`,
            });
            if (resp.status !== 200) {
                if (resp.status === 401) {
                    return {
                        status: "BOXY_ERROR",
                        message: "Invalid API Key",
                    };
                }
                return {
                    status: "BOXY_ERROR",
                    message: resp.stringResponse,
                };
            }
            if (resp.jsonResponse === undefined) {
                throw new Error("should never happen");
            }
            providerConfig.clients[0].clientId = resp.jsonResponse.clientID;
            providerConfig.clients[0].clientSecret = resp.jsonResponse.clientSecret;
        }
    }
    const thirdPartyRes = await Multitenancy.createOrUpdateThirdPartyConfig(tenantId, providerConfig, undefined, userContext);
    return thirdPartyRes;
}
