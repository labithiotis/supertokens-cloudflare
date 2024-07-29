import NormalisedURLDomain from "../../../normalisedURLDomain";
import NormalisedURLPath from "../../../normalisedURLPath";
import NewProvider from "./custom";
import { normaliseOIDCEndpointToIncludeWellKnown } from "./utils";
function Okta(input) {
  if (input.config.name === void 0) {
    input.config.name = "Okta";
  }
  const oOverride = input.override;
  input.override = function(originalImplementation) {
    const oGetConfig = originalImplementation.getConfigForClientType;
    originalImplementation.getConfigForClientType = async function(input2) {
      const config = await oGetConfig(input2);
      if (config.additionalConfig == void 0 || config.additionalConfig.oktaDomain == void 0) {
        if (config.oidcDiscoveryEndpoint === void 0) {
          throw new Error("Please provide the oktaDomain in the additionalConfig of the Okta provider.");
        }
      } else {
        const oidcDomain = new NormalisedURLDomain(config.additionalConfig.oktaDomain);
        const oidcPath = new NormalisedURLPath("/.well-known/openid-configuration");
        config.oidcDiscoveryEndpoint = oidcDomain.getAsStringDangerous() + oidcPath.getAsStringDangerous();
      }
      config.oidcDiscoveryEndpoint = normaliseOIDCEndpointToIncludeWellKnown(config.oidcDiscoveryEndpoint);
      if (config.scope === void 0) {
        config.scope = ["openid", "email"];
      }
      return config;
    };
    if (oOverride !== void 0) {
      originalImplementation = oOverride(originalImplementation);
    }
    return originalImplementation;
  };
  return NewProvider(input);
}
export {
  Okta as default
};
