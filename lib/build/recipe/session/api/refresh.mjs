import { send200Response } from "../../../utils";
async function handleRefreshAPI(apiImplementation, options, userContext) {
  if (apiImplementation.refreshPOST === void 0) {
    return false;
  }
  await apiImplementation.refreshPOST({ options, userContext });
  send200Response(options.res, {});
  return true;
}
export {
  handleRefreshAPI as default
};
