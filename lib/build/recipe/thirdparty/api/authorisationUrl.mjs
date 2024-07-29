import { send200Response } from "../../../utils";
import STError from "../error";
async function authorisationUrlAPI(apiImplementation, tenantId, options, userContext) {
  if (apiImplementation.authorisationUrlGET === void 0) {
    return false;
  }
  const thirdPartyId = options.req.getKeyValueFromQuery("thirdPartyId");
  const redirectURIOnProviderDashboard = options.req.getKeyValueFromQuery("redirectURIOnProviderDashboard");
  const clientType = options.req.getKeyValueFromQuery("clientType");
  if (thirdPartyId === void 0 || typeof thirdPartyId !== "string") {
    throw new STError({
      type: STError.BAD_INPUT_ERROR,
      message: "Please provide the thirdPartyId as a GET param"
    });
  }
  if (redirectURIOnProviderDashboard === void 0 || typeof redirectURIOnProviderDashboard !== "string") {
    throw new STError({
      type: STError.BAD_INPUT_ERROR,
      message: "Please provide the redirectURIOnProviderDashboard as a GET param"
    });
  }
  const providerResponse = await options.recipeImplementation.getProvider({
    thirdPartyId,
    clientType,
    tenantId,
    userContext
  });
  if (providerResponse === void 0) {
    throw new STError({
      type: STError.BAD_INPUT_ERROR,
      message: `the provider ${thirdPartyId} could not be found in the configuration`
    });
  }
  const provider = providerResponse;
  let result = await apiImplementation.authorisationUrlGET({
    provider,
    redirectURIOnProviderDashboard,
    tenantId,
    options,
    userContext
  });
  send200Response(options.res, result);
  return true;
}
export {
  authorisationUrlAPI as default
};
