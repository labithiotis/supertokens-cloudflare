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
import MultitenancyRecipe from "./recipe";
import { logDebugMessage } from "../../logger";
import { FactorIds } from "../multifactorauth/types";
function validateAndNormaliseUserInput(config) {
  let override = __spreadValues({
    functions: (originalImplementation) => originalImplementation,
    apis: (originalImplementation) => originalImplementation
  }, config == null ? void 0 : config.override);
  return {
    getAllowedDomainsForTenantId: config == null ? void 0 : config.getAllowedDomainsForTenantId,
    override
  };
}
const isValidFirstFactor = async function(tenantId, factorId, userContext) {
  var _b;
  const mtRecipe = MultitenancyRecipe.getInstance();
  if (mtRecipe === void 0) {
    throw new Error("Should never happen");
  }
  const tenantInfo = await mtRecipe.recipeInterfaceImpl.getTenant({ tenantId, userContext });
  if (tenantInfo === void 0) {
    return {
      status: "TENANT_NOT_FOUND_ERROR"
    };
  }
  const _a = tenantInfo, { status: _ } = _a, tenantConfig = __objRest(_a, ["status"]);
  const firstFactorsFromMFA = mtRecipe.staticFirstFactors;
  logDebugMessage(`isValidFirstFactor got ${(_b = tenantConfig.firstFactors) == null ? void 0 : _b.join(", ")} from tenant config`);
  logDebugMessage(`isValidFirstFactor got ${firstFactorsFromMFA} from MFA`);
  logDebugMessage(
    `isValidFirstFactor tenantconfig enables: ${Object.keys(tenantConfig).filter(
      (k) => {
        var _a2;
        return (_a2 = tenantConfig[k]) == null ? void 0 : _a2.enabled;
      }
    )}`
  );
  let configuredFirstFactors = tenantConfig.firstFactors !== void 0 ? tenantConfig.firstFactors : firstFactorsFromMFA;
  if (configuredFirstFactors === void 0) {
    configuredFirstFactors = mtRecipe.allAvailableFirstFactors;
  }
  if (isFactorConfiguredForTenant({
    tenantConfig,
    allAvailableFirstFactors: mtRecipe.allAvailableFirstFactors,
    firstFactors: configuredFirstFactors,
    factorId
  })) {
    return {
      status: "OK"
    };
  }
  return {
    status: "INVALID_FIRST_FACTOR_ERROR"
  };
};
function isFactorConfiguredForTenant({
  allAvailableFirstFactors,
  firstFactors,
  factorId
}) {
  let configuredFirstFactors = firstFactors.filter(
    (factorId2) => allAvailableFirstFactors.includes(factorId2) || !Object.values(FactorIds).includes(factorId2)
  );
  return configuredFirstFactors.includes(factorId);
}
export {
  isFactorConfiguredForTenant,
  isValidFirstFactor,
  validateAndNormaliseUserInput
};
