import { send200Response } from "../../../utils";
import Session from "../../session";
async function verifyTOTPAPI(apiImplementation, options, userContext) {
  if (apiImplementation.verifyTOTPPOST === void 0) {
    return false;
  }
  const session = await Session.getSession(
    options.req,
    options.res,
    { overrideGlobalClaimValidators: () => [], sessionRequired: true },
    userContext
  );
  const bodyParams = await options.req.getJSONBody();
  const totp = bodyParams.totp;
  if (totp === void 0 || typeof totp !== "string") {
    throw new Error("totp is required and must be a string");
  }
  let response = await apiImplementation.verifyTOTPPOST({
    totp,
    options,
    session,
    userContext
  });
  send200Response(options.res, response);
  return true;
}
export {
  verifyTOTPAPI as default
};
