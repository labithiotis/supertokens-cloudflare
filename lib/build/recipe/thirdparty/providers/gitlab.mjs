import NormalisedURLDomain from "../../../normalisedURLDomain";
import NormalisedURLPath from "../../../normalisedURLPath";
import NewProvider from "./custom";
import { normaliseOIDCEndpointToIncludeWellKnown } from "./utils";
function Gitlab(input) {
  if (input.config.name === void 0) {
    input.config.name = "Gitlab";
  }
  const oOverride = input.override;
  input.override = function(originalImplementation) {
    const oGetConfig = originalImplementation.getConfigForClientType;
    originalImplementation.getConfigForClientType = async function(input2) {
      const config = await oGetConfig(input2);
      if (config.scope === void 0) {
        config.scope = ["openid", "email"];
      }
      if (config.additionalConfig !== void 0 && config.additionalConfig.gitlabBaseUrl !== void 0) {
        const oidcDomain = new NormalisedURLDomain(config.additionalConfig.gitlabBaseUrl);
        const oidcPath = new NormalisedURLPath("/.well-known/openid-configuration");
        config.oidcDiscoveryEndpoint = oidcDomain.getAsStringDangerous() + oidcPath.getAsStringDangerous();
      } else if (config.oidcDiscoveryEndpoint === void 0) {
        config.oidcDiscoveryEndpoint = "https://gitlab.com/.well-known/openid-configuration";
      }
      config.oidcDiscoveryEndpoint = normaliseOIDCEndpointToIncludeWellKnown(config.oidcDiscoveryEndpoint);
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
  Gitlab as default
};
