import { send200Response } from "../../../utils";
import Session from "../../session";
async function createDeviceAPI(apiImplementation, options, userContext) {
  if (apiImplementation.createDevicePOST === void 0) {
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
  if (deviceName !== void 0 && typeof deviceName !== "string") {
    throw new Error("deviceName must be a string");
  }
  let response = await apiImplementation.createDevicePOST({
    deviceName,
    options,
    session,
    userContext
  });
  send200Response(options.res, response);
  return true;
}
export {
  createDeviceAPI as default
};
