import { send200Response } from "../../../utils";
import { validateFormFieldsOrThrowError } from "./utils";
async function generatePasswordResetToken(apiImplementation, tenantId, options, userContext) {
  if (apiImplementation.generatePasswordResetTokenPOST === void 0) {
    return false;
  }
  const requestBody = await options.req.getJSONBody();
  let formFields = await validateFormFieldsOrThrowError(
    options.config.resetPasswordUsingTokenFeature.formFieldsForGenerateTokenForm,
    requestBody.formFields,
    tenantId,
    userContext
  );
  let result = await apiImplementation.generatePasswordResetTokenPOST({
    formFields,
    tenantId,
    options,
    userContext
  });
  send200Response(options.res, result);
  return true;
}
export {
  generatePasswordResetToken as default
};
