import { send200Response } from "../../../utils";
import Session from "../../session";
async function verifyDeviceAPI(apiImplementation, options, userContext) {
  if (apiImplementation.verifyDevicePOST === void 0) {
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
  const totp = bodyParams.totp;
  if (deviceName === void 0 || typeof deviceName !== "string") {
    throw new Error("deviceName is required and must be a string");
  }
  if (totp === void 0 || typeof totp !== "string") {
    throw new Error("totp is required and must be a string");
  }
  let response = await apiImplementation.verifyDevicePOST({
    deviceName,
    totp,
    options,
    session,
    userContext
  });
  send200Response(options.res, response);
  return true;
}
export {
  verifyDeviceAPI as default
};
