import { send200Response, normaliseHttpMethod } from "../../../utils";
import STError from "../error";
import Session from "../../session";
async function emailVerify(apiImplementation, tenantId, options, userContext) {
  let result;
  if (normaliseHttpMethod(options.req.getMethod()) === "post") {
    if (apiImplementation.verifyEmailPOST === void 0) {
      return false;
    }
    const requestBody = await options.req.getJSONBody();
    let token = requestBody.token;
    if (token === void 0 || token === null) {
      throw new STError({
        type: STError.BAD_INPUT_ERROR,
        message: "Please provide the email verification token"
      });
    }
    if (typeof token !== "string") {
      throw new STError({
        type: STError.BAD_INPUT_ERROR,
        message: "The email verification token must be a string"
      });
    }
    const session = await Session.getSession(
      options.req,
      options.res,
      { overrideGlobalClaimValidators: () => [], sessionRequired: false },
      userContext
    );
    let response = await apiImplementation.verifyEmailPOST({
      token,
      tenantId,
      options,
      session,
      userContext
    });
    if (response.status === "OK") {
      result = { status: "OK" };
    } else {
      result = response;
    }
  } else {
    if (apiImplementation.isEmailVerifiedGET === void 0) {
      return false;
    }
    const session = await Session.getSession(
      options.req,
      options.res,
      { overrideGlobalClaimValidators: () => [] },
      userContext
    );
    result = await apiImplementation.isEmailVerifiedGET({
      options,
      session,
      userContext
    });
  }
  send200Response(options.res, result);
  return true;
}
export {
  emailVerify as default
};
