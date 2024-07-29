import NewProvider from "./custom";
import { normaliseOIDCEndpointToIncludeWellKnown } from "./utils";
function ActiveDirectory(input) {
  if (input.config.name === void 0) {
    input.config.name = "Active Directory";
  }
  const oOverride = input.override;
  input.override = function(originalImplementation) {
    const oGetConfig = originalImplementation.getConfigForClientType;
    originalImplementation.getConfigForClientType = async function({ clientType, userContext }) {
      const config = await oGetConfig({ clientType, userContext });
      if (config.additionalConfig == void 0 || config.additionalConfig.directoryId == void 0) {
        if (config.oidcDiscoveryEndpoint === void 0) {
          throw new Error(
            "Please provide the directoryId in the additionalConfig of the Active Directory provider."
          );
        }
      } else {
        config.oidcDiscoveryEndpoint = `https://login.microsoftonline.com/${config.additionalConfig.directoryId}/v2.0/.well-known/openid-configuration`;
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
  ActiveDirectory as default
};
