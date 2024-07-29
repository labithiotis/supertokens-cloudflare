import { send200Response } from "../../../utils";
async function getOpenIdDiscoveryConfiguration(apiImplementation, options, userContext) {
  if (apiImplementation.getOpenIdDiscoveryConfigurationGET === void 0) {
    return false;
  }
  let result = await apiImplementation.getOpenIdDiscoveryConfigurationGET({
    options,
    userContext
  });
  if (result.status === "OK") {
    options.res.setHeader("Access-Control-Allow-Origin", "*", false);
    send200Response(options.res, {
      issuer: result.issuer,
      jwks_uri: result.jwks_uri
    });
  } else {
    send200Response(options.res, result);
  }
  return true;
}
export {
  getOpenIdDiscoveryConfiguration as default
};