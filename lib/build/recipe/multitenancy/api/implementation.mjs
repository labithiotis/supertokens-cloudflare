import { isValidFirstFactor } from "../../multitenancy/utils";
import { findAndCreateProviderInstance, mergeProvidersFromCoreAndStatic } from "../../thirdparty/providers/configUtils";
import { DEFAULT_TENANT_ID } from "../constants";
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
      const mergedProviders = mergeProvidersFromCoreAndStatic(
        providerConfigsFromCore,
        providerInputsFromStatic,
        tenantId === DEFAULT_TENANT_ID
      );
      const finalProviderList = [];
      for (const providerInput of mergedProviders) {
        try {
          const providerInstance = await findAndCreateProviderInstance(
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
        let validRes = await isValidFirstFactor(tenantId, factorId, userContext);
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
export {
  getAPIInterface as default
};
