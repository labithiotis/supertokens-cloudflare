import { send200Response } from "../../../utils";
import STError from "../error";
import Session from "../../session";
async function resendCode(apiImplementation, tenantId, options, userContext) {
  if (apiImplementation.resendCodePOST === void 0) {
    return false;
  }
  const body = await options.req.getJSONBody();
  const preAuthSessionId = body.preAuthSessionId;
  const deviceId = body.deviceId;
  if (preAuthSessionId === void 0) {
    throw new STError({
      type: STError.BAD_INPUT_ERROR,
      message: "Please provide preAuthSessionId"
    });
  }
  if (deviceId === void 0) {
    throw new STError({
      type: STError.BAD_INPUT_ERROR,
      message: "Please provide a deviceId"
    });
  }
  let session = await Session.getSession(
    options.req,
    options.res,
    {
      sessionRequired: false,
      overrideGlobalClaimValidators: () => []
    },
    userContext
  );
  if (session !== void 0) {
    tenantId = session.getTenantId();
  }
  let result = await apiImplementation.resendCodePOST({
    deviceId,
    preAuthSessionId,
    tenantId,
    session,
    options,
    userContext
  });
  send200Response(options.res, result);
  return true;
}
export {
  resendCode as default
};
