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
import STError from "../error";
import Session from "../../session";
async function consumeCode(apiImplementation, tenantId, options, userContext) {
  if (apiImplementation.consumeCodePOST === void 0) {
    return false;
  }
  const body = await options.req.getJSONBody();
  const preAuthSessionId = body.preAuthSessionId;
  const linkCode = body.linkCode;
  const deviceId = body.deviceId;
  const userInputCode = body.userInputCode;
  if (preAuthSessionId === void 0) {
    throw new STError({
      type: STError.BAD_INPUT_ERROR,
      message: "Please provide preAuthSessionId"
    });
  }
  if (deviceId !== void 0 || userInputCode !== void 0) {
    if (linkCode !== void 0) {
      throw new STError({
        type: STError.BAD_INPUT_ERROR,
        message: "Please provide one of (linkCode) or (deviceId+userInputCode) and not both"
      });
    }
    if (deviceId === void 0 || userInputCode === void 0) {
      throw new STError({
        type: STError.BAD_INPUT_ERROR,
        message: "Please provide both deviceId and userInputCode"
      });
    }
  } else if (linkCode === void 0) {
    throw new STError({
      type: STError.BAD_INPUT_ERROR,
      message: "Please provide one of (linkCode) or (deviceId+userInputCode) and not both"
    });
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
  let result = await apiImplementation.consumeCodePOST(
    deviceId !== void 0 ? {
      deviceId,
      userInputCode,
      preAuthSessionId,
      tenantId,
      session,
      options,
      userContext
    } : {
      linkCode,
      options,
      preAuthSessionId,
      tenantId,
      session,
      userContext
    }
  );
  if (result.status === "OK") {
    result = __spreadValues(__spreadValues({}, result), getBackwardsCompatibleUserInfo(options.req, result, userContext));
    delete result.session;
  }
  send200Response(options.res, result);
  return true;
}
export {
  consumeCode as default
};
