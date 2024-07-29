import { send200Response } from "../../../utils";
async function loginMethodsAPI(apiImplementation, tenantId, options, userContext) {
  if (apiImplementation.loginMethodsGET === void 0) {
    return false;
  }
  const clientType = options.req.getKeyValueFromQuery("clientType");
  const result = await apiImplementation.loginMethodsGET({ tenantId, clientType, options, userContext });
  send200Response(options.res, result);
  return true;
}
export {
  loginMethodsAPI as default
};
