"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var utils_exports = {};
__export(utils_exports, {
  isFactorConfiguredForTenant: () => isFactorConfiguredForTenant,
  isValidFirstFactor: () => isValidFirstFactor,
  validateAndNormaliseUserInput: () => validateAndNormaliseUserInput
});
module.exports = __toCommonJS(utils_exports);
var import_recipe = __toESM(require("./recipe"), 1);
var import_logger = require("../../logger");
var import_types = require("../multifactorauth/types");
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
  const mtRecipe = import_recipe.default.getInstance();
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
  (0, import_logger.logDebugMessage)(`isValidFirstFactor got ${(_b = tenantConfig.firstFactors) == null ? void 0 : _b.join(", ")} from tenant config`);
  (0, import_logger.logDebugMessage)(`isValidFirstFactor got ${firstFactorsFromMFA} from MFA`);
  (0, import_logger.logDebugMessage)(
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
    (factorId2) => allAvailableFirstFactors.includes(factorId2) || !Object.values(import_types.FactorIds).includes(factorId2)
  );
  return configuredFirstFactors.includes(factorId);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isFactorConfiguredForTenant,
  isValidFirstFactor,
  validateAndNormaliseUserInput
});
