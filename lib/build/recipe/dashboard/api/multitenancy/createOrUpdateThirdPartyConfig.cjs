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
var createOrUpdateThirdPartyConfig_exports = {};
__export(createOrUpdateThirdPartyConfig_exports, {
  default: () => createOrUpdateThirdPartyConfig
});
module.exports = __toCommonJS(createOrUpdateThirdPartyConfig_exports);
var import_multitenancy = __toESM(require("../../../multitenancy"), 1);
var import_recipe = __toESM(require("../../../multitenancy/recipe"), 1);
var import_normalisedURLDomain = __toESM(require("../../../../normalisedURLDomain"), 1);
var import_normalisedURLPath = __toESM(require("../../../../normalisedURLPath"), 1);
var import_utils = require("../../../thirdparty/providers/utils");
async function createOrUpdateThirdPartyConfig(_, tenantId, options, userContext) {
  var _a;
  const requestBody = await options.req.getJSONBody();
  const { providerConfig } = requestBody;
  let tenantRes = await import_multitenancy.default.getTenant(tenantId, userContext);
  if (tenantRes === void 0) {
    return {
      status: "UNKNOWN_TENANT_ERROR"
    };
  }
  if (tenantRes.thirdParty.providers.length === 0) {
    const mtRecipe = import_recipe.default.getInstance();
    const staticProviders = (_a = mtRecipe == null ? void 0 : mtRecipe.staticThirdPartyProviders) != null ? _a : [];
    for (const provider of staticProviders.filter(
      (provider2) => provider2.includeInNonPublicTenantsByDefault === true
    )) {
      await import_multitenancy.default.createOrUpdateThirdPartyConfig(
        tenantId,
        {
          thirdPartyId: provider.config.thirdPartyId
        },
        void 0,
        userContext
      );
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  if (providerConfig.thirdPartyId.startsWith("boxy-saml")) {
    const boxyURL = providerConfig.clients[0].additionalConfig.boxyURL;
    const boxyAPIKey = providerConfig.clients[0].additionalConfig.boxyAPIKey;
    providerConfig.clients[0].additionalConfig.boxyAPIKey = void 0;
    if (boxyAPIKey && (providerConfig.clients[0].additionalConfig.samlInputType === "xml" || providerConfig.clients[0].additionalConfig.samlInputType === "url")) {
      const requestBody2 = {
        name: "",
        label: "",
        description: "",
        tenant: providerConfig.clients[0].additionalConfig.boxyTenant || `${tenantId}-${providerConfig.thirdPartyId}`,
        product: providerConfig.clients[0].additionalConfig.boxyProduct || "supertokens",
        defaultRedirectUrl: providerConfig.clients[0].additionalConfig.redirectURLs[0],
        forceAuthn: false,
        encodedRawMetadata: providerConfig.clients[0].additionalConfig.samlXML ? Buffer.from(providerConfig.clients[0].additionalConfig.samlXML).toString("base64") : "",
        redirectUrl: JSON.stringify(providerConfig.clients[0].additionalConfig.redirectURLs),
        metadataUrl: providerConfig.clients[0].additionalConfig.samlURL || ""
      };
      const normalisedDomain = new import_normalisedURLDomain.default(boxyURL);
      const normalisedBasePath = new import_normalisedURLPath.default(boxyURL);
      const connectionsPath = new import_normalisedURLPath.default("/api/v1/saml/config");
      const resp = await (0, import_utils.doPostRequest)(
        normalisedDomain.getAsStringDangerous() + normalisedBasePath.appendPath(connectionsPath).getAsStringDangerous(),
        requestBody2,
        {
          Authorization: `Api-Key ${boxyAPIKey}`
        }
      );
      if (resp.status !== 200) {
        if (resp.status === 401) {
          return {
            status: "BOXY_ERROR",
            message: "Invalid API Key"
          };
        }
        return {
          status: "BOXY_ERROR",
          message: resp.stringResponse
        };
      }
      if (resp.jsonResponse === void 0) {
        throw new Error("should never happen");
      }
      providerConfig.clients[0].clientId = resp.jsonResponse.clientID;
      providerConfig.clients[0].clientSecret = resp.jsonResponse.clientSecret;
    }
  }
  const thirdPartyRes = await import_multitenancy.default.createOrUpdateThirdPartyConfig(
    tenantId,
    providerConfig,
    void 0,
    userContext
  );
  return thirdPartyRes;
}
