"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var updateTenantSecondaryFactor_exports = {};
__export(updateTenantSecondaryFactor_exports, {
  default: () => updateTenantSecondaryFactor
});
module.exports = __toCommonJS(updateTenantSecondaryFactor_exports);
var import_recipe = __toESM(require("../../../multitenancy/recipe"), 1);
var import_recipe2 = __toESM(require("../../../multifactorauth/recipe"), 1);
var import_utils = require("./utils");
async function updateTenantSecondaryFactor(_, tenantId, options, userContext) {
  const requestBody = await options.req.getJSONBody();
  const { factorId, enable } = requestBody;
  const mtRecipe = import_recipe.default.getInstance();
  const mfaInstance = import_recipe2.default.getInstance();
  if (mfaInstance === void 0) {
    return {
      status: "MFA_NOT_INITIALIZED_ERROR"
    };
  }
  const tenantRes = await (mtRecipe == null ? void 0 : mtRecipe.recipeInterfaceImpl.getTenant({ tenantId, userContext }));
  if (tenantRes === void 0) {
    return {
      status: "UNKNOWN_TENANT_ERROR"
    };
  }
  if (enable === true) {
    const allAvailableSecondaryFactors = mfaInstance.getAllAvailableSecondaryFactorIds(tenantRes);
    if (!allAvailableSecondaryFactors.includes(factorId)) {
      return {
        status: "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK_ERROR",
        message: (0, import_utils.getFactorNotAvailableMessage)(factorId, allAvailableSecondaryFactors)
      };
    }
  }
  let secondaryFactors = (0, import_utils.getNormalisedRequiredSecondaryFactorsBasedOnTenantConfigFromCoreAndSDKInit)(tenantRes);
  if (enable === true) {
    if (!secondaryFactors.includes(factorId)) {
      secondaryFactors.push(factorId);
    }
  } else {
    secondaryFactors = secondaryFactors.filter((f) => f !== factorId);
  }
  await (mtRecipe == null ? void 0 : mtRecipe.recipeInterfaceImpl.createOrUpdateTenant({
    tenantId,
    config: {
      requiredSecondaryFactors: secondaryFactors.length > 0 ? secondaryFactors : null
    },
    userContext
  }));
  return {
    status: "OK",
    isMFARequirementsForAuthOverridden: mfaInstance.isGetMfaRequirementsForAuthOverridden
  };
}
