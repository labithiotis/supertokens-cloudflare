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
var utils_exports = {};
__export(utils_exports, {
  factorIdToRecipe: () => factorIdToRecipe,
  getFactorNotAvailableMessage: () => getFactorNotAvailableMessage,
  getNormalisedFirstFactorsBasedOnTenantConfigFromCoreAndSDKInit: () => getNormalisedFirstFactorsBasedOnTenantConfigFromCoreAndSDKInit,
  getNormalisedRequiredSecondaryFactorsBasedOnTenantConfigFromCoreAndSDKInit: () => getNormalisedRequiredSecondaryFactorsBasedOnTenantConfigFromCoreAndSDKInit
});
module.exports = __toCommonJS(utils_exports);
var import_recipe = __toESM(require("../../../multitenancy/recipe"), 1);
var import_recipe2 = __toESM(require("../../../multifactorauth/recipe"), 1);
var import_utils = require("../../../multitenancy/utils");
var import_multifactorauth = require("../../../multifactorauth");
function getNormalisedFirstFactorsBasedOnTenantConfigFromCoreAndSDKInit(tenantDetailsFromCore) {
  let firstFactors;
  let mtInstance = import_recipe.default.getInstanceOrThrowError();
  if (tenantDetailsFromCore.firstFactors !== void 0) {
    firstFactors = tenantDetailsFromCore.firstFactors;
  } else if (mtInstance.staticFirstFactors !== void 0) {
    firstFactors = mtInstance.staticFirstFactors;
  } else {
    firstFactors = Array.from(new Set(mtInstance.allAvailableFirstFactors));
  }
  let validFirstFactors = [];
  for (const factorId of firstFactors) {
    if ((0, import_utils.isFactorConfiguredForTenant)({
      tenantConfig: tenantDetailsFromCore,
      allAvailableFirstFactors: mtInstance.allAvailableFirstFactors,
      firstFactors,
      factorId
    })) {
      validFirstFactors.push(factorId);
    }
  }
  return validFirstFactors;
}
function getNormalisedRequiredSecondaryFactorsBasedOnTenantConfigFromCoreAndSDKInit(tenantDetailsFromCore) {
  const mfaInstance = import_recipe2.default.getInstance();
  if (mfaInstance === void 0) {
    return [];
  }
  let secondaryFactors = mfaInstance.getAllAvailableSecondaryFactorIds(tenantDetailsFromCore);
  secondaryFactors = secondaryFactors.filter(
    (factorId) => {
      var _a;
      return ((_a = tenantDetailsFromCore.requiredSecondaryFactors) != null ? _a : []).includes(factorId);
    }
  );
  return secondaryFactors;
}
function factorIdToRecipe(factorId) {
  const factorIdToRecipe2 = {
    emailpassword: "Emailpassword",
    thirdparty: "ThirdParty",
    "otp-email": "Passwordless",
    "otp-phone": "Passwordless",
    "link-email": "Passwordless",
    "link-phone": "Passwordless",
    totp: "Totp"
  };
  return factorIdToRecipe2[factorId];
}
function getFactorNotAvailableMessage(factorId, availableFactors) {
  const recipeName = factorIdToRecipe(factorId);
  if (recipeName !== "Passwordless") {
    return `Please initialise ${recipeName} recipe to be able to use this login method`;
  }
  const passwordlessFactors = [import_multifactorauth.FactorIds.LINK_EMAIL, import_multifactorauth.FactorIds.LINK_PHONE, import_multifactorauth.FactorIds.OTP_EMAIL, import_multifactorauth.FactorIds.OTP_PHONE];
  const passwordlessFactorsNotAvailable = passwordlessFactors.filter((f) => !availableFactors.includes(f));
  if (passwordlessFactorsNotAvailable.length === 4) {
    return `Please initialise Passwordless recipe to be able to use this login method`;
  }
  const [flowType, contactMethod] = factorId.split("-");
  return `Please ensure that Passwordless recipe is initialised with contactMethod: ${contactMethod.toUpperCase()} and flowType: ${flowType === "otp" ? "USER_INPUT_CODE" : "MAGIC_LINK"}`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  factorIdToRecipe,
  getFactorNotAvailableMessage,
  getNormalisedFirstFactorsBasedOnTenantConfigFromCoreAndSDKInit,
  getNormalisedRequiredSecondaryFactorsBasedOnTenantConfigFromCoreAndSDKInit
});
