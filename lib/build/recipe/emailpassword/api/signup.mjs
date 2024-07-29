var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
import { getBackwardsCompatibleUserInfo, send200Response } from "../../../utils";
import { validateFormFieldsOrThrowError } from "./utils";
import STError from "../error";
import Session from "../../session";
async function signUpAPI(apiImplementation, tenantId, options, userContext) {
  if (apiImplementation.signUpPOST === void 0) {
    return false;
  }
  const requestBody = await options.req.getJSONBody();
  let formFields = await validateFormFieldsOrThrowError(
    options.config.signUpFeature.formFields,
    requestBody.formFields,
    tenantId,
    userContext
  );
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
  let result = await apiImplementation.signUpPOST({
    formFields,
    tenantId,
    session,
    options,
    userContext
  });
  if (result.status === "OK") {
    send200Response(options.res, __spreadValues({
      status: "OK"
    }, getBackwardsCompatibleUserInfo(options.req, result, userContext)));
  } else if (result.status === "GENERAL_ERROR") {
    send200Response(options.res, result);
  } else if (result.status === "EMAIL_ALREADY_EXISTS_ERROR") {
    throw new STError({
      type: STError.FIELD_ERROR,
      payload: [
        {
          id: "email",
          error: "This email already exists. Please sign in instead."
        }
      ],
      message: "Error in input formFields"
    });
  } else {
    send200Response(options.res, result);
  }
  return true;
}
export {
  signUpAPI as default
};
