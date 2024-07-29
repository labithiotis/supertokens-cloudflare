import { send200Response } from "../../../utils";
import STError from "../error";
import parsePhoneNumber from "libphonenumber-js/max";
import Session from "../../session";
async function createCode(apiImplementation, tenantId, options, userContext) {
  if (apiImplementation.createCodePOST === void 0) {
    return false;
  }
  const body = await options.req.getJSONBody();
  let email = body.email;
  let phoneNumber = body.phoneNumber;
  if (email !== void 0 && phoneNumber !== void 0 || email === void 0 && phoneNumber === void 0) {
    throw new STError({
      type: STError.BAD_INPUT_ERROR,
      message: "Please provide exactly one of email or phoneNumber"
    });
  }
  if (email === void 0 && options.config.contactMethod === "EMAIL") {
    throw new STError({
      type: STError.BAD_INPUT_ERROR,
      message: 'Please provide an email since you have set the contactMethod to "EMAIL"'
    });
  }
  if (phoneNumber === void 0 && options.config.contactMethod === "PHONE") {
    throw new STError({
      type: STError.BAD_INPUT_ERROR,
      message: 'Please provide a phoneNumber since you have set the contactMethod to "PHONE"'
    });
  }
  if (email !== void 0 && (options.config.contactMethod === "EMAIL" || options.config.contactMethod === "EMAIL_OR_PHONE")) {
    email = email.trim();
    const validateError = await options.config.validateEmailAddress(email, tenantId);
    if (validateError !== void 0) {
      send200Response(options.res, {
        status: "GENERAL_ERROR",
        message: validateError
      });
      return true;
    }
  }
  if (phoneNumber !== void 0 && (options.config.contactMethod === "PHONE" || options.config.contactMethod === "EMAIL_OR_PHONE")) {
    const validateError = await options.config.validatePhoneNumber(phoneNumber, tenantId);
    if (validateError !== void 0) {
      send200Response(options.res, {
        status: "GENERAL_ERROR",
        message: validateError
      });
      return true;
    }
    const parsedPhoneNumber = parsePhoneNumber(phoneNumber);
    if (parsedPhoneNumber === void 0) {
      phoneNumber = phoneNumber.trim();
    } else {
      phoneNumber = parsedPhoneNumber.format("E.164");
    }
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
  let result = await apiImplementation.createCodePOST(
    email !== void 0 ? { email, session, tenantId, options, userContext } : { phoneNumber, session, tenantId, options, userContext }
  );
  send200Response(options.res, result);
  return true;
}
export {
  createCode as default
};
