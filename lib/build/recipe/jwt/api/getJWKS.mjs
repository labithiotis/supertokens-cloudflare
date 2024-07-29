import { send200Response } from "../../../utils";
async function getJWKS(apiImplementation, options, userContext) {
  if (apiImplementation.getJWKSGET === void 0) {
    return false;
  }
  let result = await apiImplementation.getJWKSGET({
    options,
    userContext
  });
  if ("status" in result && result.status === "GENERAL_ERROR") {
    send200Response(options.res, result);
  } else {
    options.res.setHeader("Access-Control-Allow-Origin", "*", false);
    send200Response(options.res, result);
  }
  return true;
}
export {
  getJWKS as default
};
