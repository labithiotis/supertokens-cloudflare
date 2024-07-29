import { send200Response } from "../../../utils";
import { getSessionFromRequest } from "../sessionRequestFunctions";
async function signOutAPI(apiImplementation, options, userContext) {
  if (apiImplementation.signOutPOST === void 0) {
    return false;
  }
  const session = await getSessionFromRequest({
    req: options.req,
    res: options.res,
    config: options.config,
    recipeInterfaceImpl: options.recipeImplementation,
    options: {
      sessionRequired: true,
      overrideGlobalClaimValidators: () => []
    },
    userContext
  });
  if (session === void 0) {
    throw new Error("should never come here");
  }
  let result = await apiImplementation.signOutPOST({
    options,
    session,
    userContext
  });
  send200Response(options.res, result);
  return true;
}
export {
  signOutAPI as default
};
