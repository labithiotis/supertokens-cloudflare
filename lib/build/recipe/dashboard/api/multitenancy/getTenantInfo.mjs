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
import MultitenancyRecipe from "../../../multitenancy/recipe";
import SuperTokens from "../../../../supertokens";
import { getNormalisedFirstFactorsBasedOnTenantConfigFromCoreAndSDKInit } from "./utils";
import {
  findAndCreateProviderInstance,
  mergeProvidersFromCoreAndStatic
} from "../../../thirdparty/providers/configUtils";
import NormalisedURLPath from "../../../../normalisedURLPath";
import { Querier } from "../../../../querier";
import { DEFAULT_TENANT_ID } from "../../../multitenancy/constants";
async function getTenantInfo(_, tenantId, options, userContext) {
  var _b, _c;
  let tenantRes = await Multitenancy.getTenant(tenantId, userContext);
  if (tenantRes === void 0) {
    return {
      status: "UNKNOWN_TENANT_ERROR"
    };
  }
  let _a = tenantRes, { status } = _a, tenantConfig = __objRest(_a, ["status"]);
  let firstFactors = getNormalisedFirstFactorsBasedOnTenantConfigFromCoreAndSDKInit(tenantConfig);
  if (tenantRes === void 0) {
    return {
      status: "UNKNOWN_TENANT_ERROR"
    };
  }
  const userCount = await SuperTokens.getInstanceOrThrowError().getUserCount(void 0, tenantId, userContext);
  const providersFromCore = (_b = tenantRes == null ? void 0 : tenantRes.thirdParty) == null ? void 0 : _b.providers;
  const mtRecipe = MultitenancyRecipe.getInstance();
  const staticProviders = (_c = mtRecipe == null ? void 0 : mtRecipe.staticThirdPartyProviders) != null ? _c : [];
  const mergedProvidersFromCoreAndStatic = mergeProvidersFromCoreAndStatic(
    providersFromCore,
    staticProviders,
    tenantId === DEFAULT_TENANT_ID
  );
  let querier = Querier.getNewInstanceOrThrowError(options.recipeId);
  let coreConfig = await querier.sendGetRequest(
    new NormalisedURLPath(`/${tenantId}/recipe/dashboard/tenant/core-config`),
    {},
    userContext
  );
  const tenant = {
    tenantId,
    thirdParty: {
      providers: await Promise.all(
        mergedProvidersFromCoreAndStatic.map(async (provider) => {
          try {
            const providerInstance = await findAndCreateProviderInstance(
              mergedProvidersFromCoreAndStatic,
              provider.config.thirdPartyId,
              provider.config.clients[0].clientType,
              userContext
            );
            return { thirdPartyId: provider.config.thirdPartyId, name: providerInstance == null ? void 0 : providerInstance.config.name };
          } catch (_2) {
            return {
              thirdPartyId: provider.config.thirdPartyId,
              name: provider.config.thirdPartyId
            };
          }
        })
      )
    },
    firstFactors,
    requiredSecondaryFactors: tenantRes.requiredSecondaryFactors,
    coreConfig: coreConfig.config,
    userCount
  };
  return {
    status: "OK",
    tenant
  };
}
export {
  getTenantInfo as default
};
