import { send200Response } from "../../../utils";
import Session from "../../session";
async function generateEmailVerifyToken(apiImplementation, options, userContext) {
  if (apiImplementation.generateEmailVerifyTokenPOST === void 0) {
    return false;
  }
  const session = await Session.getSession(
    options.req,
    options.res,
    { overrideGlobalClaimValidators: () => [] },
    userContext
  );
  const result = await apiImplementation.generateEmailVerifyTokenPOST({
    options,
    session,
    userContext
  });
  send200Response(options.res, result);
  return true;
}
export {
  generateEmailVerifyToken as default
};
