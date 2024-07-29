var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
import Multitenancy from "../../../multitenancy";
import SuperTokensError from "../../../../error";
async function createTenant(_, __, options, userContext) {
  const requestBody = await options.req.getJSONBody();
  const _a = requestBody, { tenantId } = _a, config = __objRest(_a, ["tenantId"]);
  if (typeof tenantId !== "string" || tenantId === "") {
    throw new SuperTokensError({
      message: "Missing required parameter 'tenantId'",
      type: SuperTokensError.BAD_INPUT_ERROR
    });
  }
  let tenantRes;
  try {
    tenantRes = await Multitenancy.createOrUpdateTenant(tenantId, config, userContext);
  } catch (err) {
    const errMsg = err == null ? void 0 : err.message;
    if (errMsg.includes("SuperTokens core threw an error for a ")) {
      if (errMsg.includes("with status code: 402")) {
        return {
          status: "MULTITENANCY_NOT_ENABLED_IN_CORE_ERROR"
        };
      }
      if (errMsg.includes("with status code: 400")) {
        return {
          status: "INVALID_TENANT_ID_ERROR",
          message: errMsg.split(" and message: ")[1]
        };
      }
    }
    throw err;
  }
  if (tenantRes.createdNew === false) {
    return {
      status: "TENANT_ID_ALREADY_EXISTS_ERROR"
    };
  }
  return tenantRes;
}
export {
  createTenant as default
};
