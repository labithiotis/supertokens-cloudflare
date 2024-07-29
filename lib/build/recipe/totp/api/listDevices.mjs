import { send200Response } from "../../../utils";
import Session from "../../session";
async function listDevicesAPI(apiImplementation, options, userContext) {
  if (apiImplementation.listDevicesGET === void 0) {
    return false;
  }
  const session = await Session.getSession(
    options.req,
    options.res,
    { overrideGlobalClaimValidators: () => [], sessionRequired: true },
    userContext
  );
  let response = await apiImplementation.listDevicesGET({
    options,
    session,
    userContext
  });
  send200Response(options.res, response);
  return true;
}
export {
  listDevicesAPI as default
};
