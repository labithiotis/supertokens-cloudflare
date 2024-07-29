import { send200Response } from "../../../utils";
import Session from "../../session";
async function resyncSessionAndFetchMFAInfo(apiImplementation, options, userContext) {
  if (apiImplementation.resyncSessionAndFetchMFAInfoPUT === void 0) {
    return false;
  }
  const session = await Session.getSession(
    options.req,
    options.res,
    { overrideGlobalClaimValidators: () => [], sessionRequired: true },
    userContext
  );
  let response = await apiImplementation.resyncSessionAndFetchMFAInfoPUT({
    options,
    session,
    userContext
  });
  send200Response(options.res, response);
  return true;
}
export {
  resyncSessionAndFetchMFAInfo as default
};
