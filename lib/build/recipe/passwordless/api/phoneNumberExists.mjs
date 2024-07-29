import { send200Response } from "../../../utils";
import STError from "../error";
async function phoneNumberExists(apiImplementation, tenantId, options, userContext) {
  if (apiImplementation.phoneNumberExistsGET === void 0) {
    return false;
  }
  let phoneNumber = options.req.getKeyValueFromQuery("phoneNumber");
  if (phoneNumber === void 0 || typeof phoneNumber !== "string") {
    throw new STError({
      type: STError.BAD_INPUT_ERROR,
      message: "Please provide the phoneNumber as a GET param"
    });
  }
  let result = await apiImplementation.phoneNumberExistsGET({
    phoneNumber,
    tenantId,
    options,
    userContext
  });
  send200Response(options.res, result);
  return true;
}
export {
  phoneNumberExists as default
};
