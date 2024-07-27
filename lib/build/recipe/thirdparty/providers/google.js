import NewProvider from "./custom";
import { normaliseOIDCEndpointToIncludeWellKnown } from "./utils";
export default function Google(input) {
    if (input.config.name === undefined) {
        input.config.name = "Google";
    }
    if (input.config.oidcDiscoveryEndpoint === undefined) {
        input.config.oidcDiscoveryEndpoint = "https://accounts.google.com/.well-known/openid-configuration";
    }
    input.config.authorizationEndpointQueryParams = Object.assign({ included_grant_scopes: "true", access_type: "offline" }, input.config.authorizationEndpointQueryParams);
    const oOverride = input.override;
    input.override = function (originalImplementation) {
        const oGetConfig = originalImplementation.getConfigForClientType;
        originalImplementation.getConfigForClientType = async function (input) {
            const config = await oGetConfig(input);
            if (config.scope === undefined) {
                config.scope = ["openid", "email"];
            }
            // The config could be coming from core where we didn't add the well-known previously
            config.oidcDiscoveryEndpoint = normaliseOIDCEndpointToIncludeWellKnown(config.oidcDiscoveryEndpoint);
            return config;
        };
        if (oOverride !== undefined) {
            originalImplementation = oOverride(originalImplementation);
        }
        return originalImplementation;
    };
    return NewProvider(input);
}
