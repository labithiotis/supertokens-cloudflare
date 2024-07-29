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
var deleteThirdPartyConfig_exports = {};
__export(deleteThirdPartyConfig_exports, {
  default: () => deleteThirdPartyConfig
});
module.exports = __toCommonJS(deleteThirdPartyConfig_exports);
var import_multitenancy = __toESM(require("../../../multitenancy"), 1);
var import_recipe = __toESM(require("../../../multitenancy/recipe"), 1);
var import_error = __toESM(require("../../../../error"), 1);
var import_multifactorauth = require("../../../multifactorauth");
async function deleteThirdPartyConfig(_, tenantId, options, userContext) {
  var _a;
  const thirdPartyId = options.req.getKeyValueFromQuery("thirdPartyId");
  if (typeof tenantId !== "string" || tenantId === "" || typeof thirdPartyId !== "string" || thirdPartyId === "") {
    throw new import_error.default({
      message: "Missing required parameter 'tenantId' or 'thirdPartyId'",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  const tenantRes = await import_multitenancy.default.getTenant(tenantId, userContext);
  if (tenantRes === void 0) {
    return {
      status: "UNKNOWN_TENANT_ERROR"
    };
  }
  const thirdPartyIdsFromCore = tenantRes.thirdParty.providers.map((provider) => provider.thirdPartyId);
  if (thirdPartyIdsFromCore.length === 0) {
    const mtRecipe = import_recipe.default.getInstance();
    const staticProviders = (_a = mtRecipe == null ? void 0 : mtRecipe.staticThirdPartyProviders) != null ? _a : [];
    let staticProviderIds = staticProviders.map((provider) => provider.config.thirdPartyId);
    for (const providerId of staticProviderIds) {
      await import_multitenancy.default.createOrUpdateThirdPartyConfig(
        tenantId,
        {
          thirdPartyId: providerId
        },
        void 0,
        userContext
      );
      await new Promise((r) => setTimeout(r, 500));
    }
  } else if (thirdPartyIdsFromCore.length === 1 && thirdPartyIdsFromCore[0] === thirdPartyId) {
    if (tenantRes.firstFactors === void 0) {
      await import_multitenancy.default.createOrUpdateTenant(tenantId, {
        firstFactors: [
          import_multifactorauth.FactorIds.EMAILPASSWORD,
          import_multifactorauth.FactorIds.OTP_PHONE,
          import_multifactorauth.FactorIds.OTP_EMAIL,
          import_multifactorauth.FactorIds.LINK_PHONE,
          import_multifactorauth.FactorIds.LINK_EMAIL
        ]
      });
    } else if (tenantRes.firstFactors.includes("thirdparty")) {
      const newFirstFactors = tenantRes.firstFactors.filter((factor) => factor !== "thirdparty");
      await import_multitenancy.default.createOrUpdateTenant(tenantId, {
        firstFactors: newFirstFactors
      });
    }
  }
  return await import_multitenancy.default.deleteThirdPartyConfig(tenantId, thirdPartyId, userContext);
}
