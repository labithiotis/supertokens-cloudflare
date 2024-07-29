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
import STError from "../error";
import { getBackwardsCompatibleUserInfo, send200Response } from "../../../utils";
import Session from "../../session";
async function signInUpAPI(apiImplementation, tenantId, options, userContext) {
  if (apiImplementation.signInUpPOST === void 0) {
    return false;
  }
  const bodyParams = await options.req.getJSONBody();
  const thirdPartyId = bodyParams.thirdPartyId;
  const clientType = bodyParams.clientType;
  if (thirdPartyId === void 0 || typeof thirdPartyId !== "string") {
    throw new STError({
      type: STError.BAD_INPUT_ERROR,
      message: "Please provide the thirdPartyId in request body"
    });
  }
  let redirectURIInfo;
  let oAuthTokens;
  if (bodyParams.redirectURIInfo !== void 0) {
    if (bodyParams.redirectURIInfo.redirectURIOnProviderDashboard === void 0) {
      throw new STError({
        type: STError.BAD_INPUT_ERROR,
        message: "Please provide the redirectURIOnProviderDashboard in request body"
      });
    }
    redirectURIInfo = bodyParams.redirectURIInfo;
  } else if (bodyParams.oAuthTokens !== void 0) {
    oAuthTokens = bodyParams.oAuthTokens;
  } else {
    throw new STError({
      type: STError.BAD_INPUT_ERROR,
      message: "Please provide one of redirectURIInfo or oAuthTokens in the request body"
    });
  }
  const providerResponse = await options.recipeImplementation.getProvider({
    thirdPartyId,
    tenantId,
    clientType,
    userContext
  });
  if (providerResponse === void 0) {
    throw new STError({
      type: STError.BAD_INPUT_ERROR,
      message: `the provider ${thirdPartyId} could not be found in the configuration`
    });
  }
  const provider = providerResponse;
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
  let result = await apiImplementation.signInUpPOST({
    provider,
    redirectURIInfo,
    oAuthTokens,
    tenantId,
    session,
    options,
    userContext
  });
  if (result.status === "OK") {
    send200Response(options.res, __spreadValues({
      status: result.status
    }, getBackwardsCompatibleUserInfo(options.req, result, userContext)));
  } else {
    send200Response(options.res, result);
  }
  return true;
}
export {
  signInUpAPI as default
};
