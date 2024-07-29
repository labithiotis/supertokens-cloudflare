import { send200Response } from "../../../utils";
import { validateFormFieldsOrThrowError } from "./utils";
import STError from "../error";
async function passwordReset(apiImplementation, tenantId, options, userContext) {
  if (apiImplementation.passwordResetPOST === void 0) {
    return false;
  }
  const requestBody = await options.req.getJSONBody();
  let formFields = await validateFormFieldsOrThrowError(
    options.config.resetPasswordUsingTokenFeature.formFieldsForPasswordResetForm,
    requestBody.formFields,
    tenantId,
    userContext
  );
  let token = requestBody.token;
  if (token === void 0) {
    throw new STError({
      type: STError.BAD_INPUT_ERROR,
      message: "Please provide the password reset token"
    });
  }
  if (typeof token !== "string") {
    throw new STError({
      type: STError.BAD_INPUT_ERROR,
      message: "The password reset token must be a string"
    });
  }
  let result = await apiImplementation.passwordResetPOST({
    formFields,
    token,
    tenantId,
    options,
    userContext
  });
  if (result.status === "PASSWORD_POLICY_VIOLATED_ERROR") {
    throw new STError({
      type: STError.FIELD_ERROR,
      payload: [
        {
          id: "password",
          error: result.failureReason
        }
      ],
      message: "Error in input formFields"
    });
  }
  send200Response(
    options.res,
    result.status === "OK" ? {
      status: "OK"
    } : result
  );
  return true;
}
export {
  passwordReset as default
};
