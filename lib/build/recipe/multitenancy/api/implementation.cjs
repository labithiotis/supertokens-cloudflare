"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var implementation_exports = {};
__export(implementation_exports, {
  default: () => getAPIInterface
});
module.exports = __toCommonJS(implementation_exports);
var import_utils = require("../../multitenancy/utils");
var import_configUtils = require("../../thirdparty/providers/configUtils");
var import_constants = require("../constants");
function getAPIInterface() {
  return {
    loginMethodsGET: async function({ tenantId, clientType, options, userContext }) {
      const tenantConfigRes = await options.recipeImplementation.getTenant({
        tenantId,
        userContext
      });
      if (tenantConfigRes === void 0) {
        throw new Error("Tenant not found");
      }
      const providerInputsFromStatic = options.staticThirdPartyProviders;
      const providerConfigsFromCore = tenantConfigRes.thirdParty.providers;
      const mergedProviders = (0, import_configUtils.mergeProvidersFromCoreAndStatic)(
        providerConfigsFromCore,
        providerInputsFromStatic,
        tenantId === import_constants.DEFAULT_TENANT_ID
      );
      const finalProviderList = [];
      for (const providerInput of mergedProviders) {
        try {
          const providerInstance = await (0, import_configUtils.findAndCreateProviderInstance)(
            mergedProviders,
            providerInput.config.thirdPartyId,
            clientType,
            userContext
          );
          if (providerInstance === void 0) {
            throw new Error("should never come here");
          }
          finalProviderList.push({
            id: providerInstance.id,
            name: providerInstance.config.name
          });
        } catch (err) {
          if ((err == null ? void 0 : err.type) === "CLIENT_TYPE_NOT_FOUND_ERROR") {
            continue;
          }
          throw err;
        }
      }
      let firstFactors;
      if (tenantConfigRes.firstFactors !== void 0) {
        firstFactors = tenantConfigRes.firstFactors;
      } else if (options.staticFirstFactors !== void 0) {
        firstFactors = options.staticFirstFactors;
      } else {
        firstFactors = Array.from(new Set(options.allAvailableFirstFactors));
      }
      let validFirstFactors = [];
      for (const factorId of firstFactors) {
        let validRes = await (0, import_utils.isValidFirstFactor)(tenantId, factorId, userContext);
        if (validRes.status === "OK") {
          validFirstFactors.push(factorId);
        }
        if (validRes.status === "TENANT_NOT_FOUND_ERROR") {
          throw new Error("Tenant not found");
        }
      }
      return {
        status: "OK",
        emailPassword: {
          enabled: validFirstFactors.includes("emailpassword")
        },
        thirdParty: {
          enabled: validFirstFactors.includes("thirdparty"),
          providers: finalProviderList
        },
        passwordless: {
          enabled: validFirstFactors.includes("otp-email") || validFirstFactors.includes("otp-phone") || validFirstFactors.includes("link-email") || validFirstFactors.includes("link-phone")
        },
        firstFactors: validFirstFactors
      };
    }
  };
}
