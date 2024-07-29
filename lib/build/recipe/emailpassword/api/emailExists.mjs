import { send200Response } from "../../../utils";
import STError from "../error";
async function emailExists(apiImplementation, tenantId, options, userContext) {
  if (apiImplementation.emailExistsGET === void 0) {
    return false;
  }
  let email = options.req.getKeyValueFromQuery("email");
  if (email === void 0 || typeof email !== "string") {
    throw new STError({
      type: STError.BAD_INPUT_ERROR,
      message: "Please provide the email as a GET param"
    });
  }
  let result = await apiImplementation.emailExistsGET({
    email,
    tenantId,
    options,
    userContext
  });
  send200Response(options.res, result);
  return true;
}
export {
  emailExists as default
};
