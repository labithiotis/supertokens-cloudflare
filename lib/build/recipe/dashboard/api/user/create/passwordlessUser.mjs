import STError from "../../../../../error";
import Passwordless from "../../../../passwordless";
import PasswordlessRecipe from "../../../../passwordless/recipe";
import { parsePhoneNumber } from "libphonenumber-js/max";
const createPasswordlessUser = async (_, tenantId, options, __) => {
  let passwordlessRecipe = void 0;
  try {
    passwordlessRecipe = PasswordlessRecipe.getInstanceOrThrowError();
  } catch (_2) {
    return {
      status: "FEATURE_NOT_ENABLED_ERROR"
    };
  }
  const requestBody = await options.req.getJSONBody();
  let email = requestBody.email;
  let phoneNumber = requestBody.phoneNumber;
  if (email !== void 0 && phoneNumber !== void 0 || email === void 0 && phoneNumber === void 0) {
    throw new STError({
      type: STError.BAD_INPUT_ERROR,
      message: "Please provide exactly one of email or phoneNumber"
    });
  }
  if (email !== void 0 && (passwordlessRecipe.config.contactMethod === "EMAIL" || passwordlessRecipe.config.contactMethod === "EMAIL_OR_PHONE")) {
    email = email.trim();
    let validationError = void 0;
    validationError = await passwordlessRecipe.config.validateEmailAddress(email, tenantId);
    if (validationError !== void 0) {
      return {
        status: "EMAIL_VALIDATION_ERROR",
        message: validationError
      };
    }
  }
  if (phoneNumber !== void 0 && (passwordlessRecipe.config.contactMethod === "PHONE" || passwordlessRecipe.config.contactMethod === "EMAIL_OR_PHONE")) {
    let validationError = void 0;
    validationError = await passwordlessRecipe.config.validatePhoneNumber(phoneNumber, tenantId);
    if (validationError !== void 0) {
      return {
        status: "PHONE_VALIDATION_ERROR",
        message: validationError
      };
    }
    const parsedPhoneNumber = parsePhoneNumber(phoneNumber);
    if (parsedPhoneNumber === void 0) {
      phoneNumber = phoneNumber.trim();
    } else {
      phoneNumber = parsedPhoneNumber.format("E.164");
    }
  }
  return await Passwordless.signInUp(
    email !== void 0 ? { email, tenantId } : { phoneNumber, tenantId }
  );
};
export {
  createPasswordlessUser
};
