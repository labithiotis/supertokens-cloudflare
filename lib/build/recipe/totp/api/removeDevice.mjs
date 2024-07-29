import { send200Response } from "../../../utils";
import Session from "../../session";
async function removeDeviceAPI(apiImplementation, options, userContext) {
  if (apiImplementation.removeDevicePOST === void 0) {
    return false;
  }
  const session = await Session.getSession(
    options.req,
    options.res,
    { overrideGlobalClaimValidators: () => [], sessionRequired: true },
    userContext
  );
  const bodyParams = await options.req.getJSONBody();
  const deviceName = bodyParams.deviceName;
  if (deviceName === void 0 || typeof deviceName !== "string" || deviceName.length === 0) {
    throw new Error("deviceName is required and must be a non-empty string");
  }
  let response = await apiImplementation.removeDevicePOST({
    deviceName,
    options,
    session,
    userContext
  });
  send200Response(options.res, response);
  return true;
}
export {
  removeDeviceAPI as default
};
