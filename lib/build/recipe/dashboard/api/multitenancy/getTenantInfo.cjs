"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var getTenantInfo_exports = {};
__export(getTenantInfo_exports, {
  default: () => getTenantInfo
});
module.exports = __toCommonJS(getTenantInfo_exports);
var import_multitenancy = __toESM(require("../../../multitenancy"), 1);
var import_recipe = __toESM(require("../../../multitenancy/recipe"), 1);
var import_supertokens = __toESM(require("../../../../supertokens"), 1);
var import_utils = require("./utils");
var import_configUtils = require("../../../thirdparty/providers/configUtils");
var import_normalisedURLPath = __toESM(require("../../../../normalisedURLPath"), 1);
var import_querier = require("../../../../querier");
var import_constants = require("../../../multitenancy/constants");
async function getTenantInfo(_, tenantId, options, userContext) {
  var _b, _c;
  let tenantRes = await import_multitenancy.default.getTenant(tenantId, userContext);
  if (tenantRes === void 0) {
    return {
      status: "UNKNOWN_TENANT_ERROR"
    };
  }
  let _a = tenantRes, { status } = _a, tenantConfig = __objRest(_a, ["status"]);
  let firstFactors = (0, import_utils.getNormalisedFirstFactorsBasedOnTenantConfigFromCoreAndSDKInit)(tenantConfig);
  if (tenantRes === void 0) {
    return {
      status: "UNKNOWN_TENANT_ERROR"
    };
  }
  const userCount = await import_supertokens.default.getInstanceOrThrowError().getUserCount(void 0, tenantId, userContext);
  const providersFromCore = (_b = tenantRes == null ? void 0 : tenantRes.thirdParty) == null ? void 0 : _b.providers;
  const mtRecipe = import_recipe.default.getInstance();
  const staticProviders = (_c = mtRecipe == null ? void 0 : mtRecipe.staticThirdPartyProviders) != null ? _c : [];
  const mergedProvidersFromCoreAndStatic = (0, import_configUtils.mergeProvidersFromCoreAndStatic)(
    providersFromCore,
    staticProviders,
    tenantId === import_constants.DEFAULT_TENANT_ID
  );
  let querier = import_querier.Querier.getNewInstanceOrThrowError(options.recipeId);
  let coreConfig = await querier.sendGetRequest(
    new import_normalisedURLPath.default(`/${tenantId}/recipe/dashboard/tenant/core-config`),
    {},
    userContext
  );
  const tenant = {
    tenantId,
    thirdParty: {
      providers: await Promise.all(
        mergedProvidersFromCoreAndStatic.map(async (provider) => {
          try {
            const providerInstance = await (0, import_configUtils.findAndCreateProviderInstance)(
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
