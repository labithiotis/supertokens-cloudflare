"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
var getThirdPartyConfig_exports = {};
__export(getThirdPartyConfig_exports, {
  default: () => getThirdPartyConfig
});
module.exports = __toCommonJS(getThirdPartyConfig_exports);
var import_multitenancy = __toESM(require("../../../multitenancy"), 1);
var import_recipe = __toESM(require("../../../multitenancy/recipe"), 1);
var import_configUtils = require("../../../thirdparty/providers/configUtils");
var import_normalisedURLDomain = __toESM(require("../../../../normalisedURLDomain"), 1);
var import_normalisedURLPath = __toESM(require("../../../../normalisedURLPath"), 1);
var import_utils = require("../../../thirdparty/providers/utils");
async function getThirdPartyConfig(_, tenantId, options, userContext) {
  var _a, _b, _c, _d, _f;
  let tenantRes = await import_multitenancy.default.getTenant(tenantId, userContext);
  if (tenantRes === void 0) {
    return {
      status: "UNKNOWN_TENANT_ERROR"
    };
  }
  const thirdPartyId = options.req.getKeyValueFromQuery("thirdPartyId");
  if (thirdPartyId === void 0) {
    throw new Error("Please provide thirdPartyId");
  }
  let providersFromCore = (_a = tenantRes == null ? void 0 : tenantRes.thirdParty) == null ? void 0 : _a.providers;
  const mtRecipe = import_recipe.default.getInstance();
  let staticProviders = (mtRecipe == null ? void 0 : mtRecipe.staticThirdPartyProviders) ? mtRecipe.staticThirdPartyProviders.map((provider) => __spreadValues({}, provider)) : [];
  let additionalConfig = void 0;
  providersFromCore = providersFromCore.filter((provider) => provider.thirdPartyId === thirdPartyId);
  if (providersFromCore.length === 0) {
    providersFromCore.push({
      thirdPartyId
    });
  }
  if (["okta", "active-directory", "boxy-saml", "google-workspaces"].includes(thirdPartyId)) {
    if (thirdPartyId === "okta") {
      const oktaDomain = options.req.getKeyValueFromQuery("oktaDomain");
      if (oktaDomain !== void 0) {
        additionalConfig = { oktaDomain };
      }
    } else if (thirdPartyId === "active-directory") {
      const directoryId = options.req.getKeyValueFromQuery("directoryId");
      if (directoryId !== void 0) {
        additionalConfig = { directoryId };
      }
    } else if (thirdPartyId === "boxy-saml") {
      let boxyURL = options.req.getKeyValueFromQuery("boxyUrl");
      let boxyAPIKey = options.req.getKeyValueFromQuery("boxyAPIKey");
      if (boxyURL !== void 0) {
        additionalConfig = { boxyURL };
        if (boxyAPIKey !== void 0) {
          additionalConfig = __spreadProps(__spreadValues({}, additionalConfig), { boxyAPIKey });
        }
      }
    } else if (thirdPartyId === "google-workspaces") {
      const hd = options.req.getKeyValueFromQuery("hd");
      if (hd !== void 0) {
        additionalConfig = { hd };
      }
    }
    if (additionalConfig !== void 0) {
      providersFromCore[0].oidcDiscoveryEndpoint = void 0;
      providersFromCore[0].authorizationEndpoint = void 0;
      providersFromCore[0].tokenEndpoint = void 0;
      providersFromCore[0].userInfoEndpoint = void 0;
      providersFromCore[0].clients = ((_b = providersFromCore[0].clients) != null ? _b : []).map((client) => __spreadProps(__spreadValues({}, client), {
        additionalConfig: __spreadValues(__spreadValues({}, client.additionalConfig), additionalConfig)
      }));
    }
  }
  staticProviders = staticProviders.filter((provider) => provider.config.thirdPartyId === thirdPartyId);
  if (staticProviders.length === 0 && thirdPartyId === "apple") {
    staticProviders.push({
      config: {
        thirdPartyId: "apple",
        clients: [
          {
            clientId: "nonguessable-temporary-client-id"
          }
        ]
      }
    });
    additionalConfig = {
      teamId: "",
      keyId: "",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgu8gXs+XYkqXD6Ala9Sf/iJXzhbwcoG5dMh1OonpdJUmgCgYIKoZIzj0DAQehRANCAASfrvlFbFCYqn3I2zeknYXLwtH30JuOKestDbSfZYxZNMqhF/OzdZFTV0zc5u5s3eN+oCWbnvl0hM+9IW0UlkdA\n-----END PRIVATE KEY-----"
    };
  }
  if (staticProviders.length === 1) {
    if (additionalConfig !== void 0) {
      staticProviders[0] = __spreadProps(__spreadValues({}, staticProviders[0]), {
        config: __spreadProps(__spreadValues({}, staticProviders[0].config), {
          oidcDiscoveryEndpoint: void 0,
          authorizationEndpoint: void 0,
          tokenEndpoint: void 0,
          userInfoEndpoint: void 0,
          clients: ((_c = staticProviders[0].config.clients) != null ? _c : []).map((client) => __spreadProps(__spreadValues({}, client), {
            additionalConfig: __spreadValues(__spreadValues({}, client.additionalConfig), additionalConfig)
          }))
        })
      });
    }
  }
  let mergedProvidersFromCoreAndStatic = (0, import_configUtils.mergeProvidersFromCoreAndStatic)(providersFromCore, staticProviders, true);
  if (mergedProvidersFromCoreAndStatic.length !== 1) {
    throw new Error("should never come here!");
  }
  for (const mergedProvider of mergedProvidersFromCoreAndStatic) {
    if (mergedProvider.config.thirdPartyId === thirdPartyId) {
      if (mergedProvider.config.clients === void 0 || mergedProvider.config.clients.length === 0) {
        mergedProvider.config.clients = [
          __spreadValues({
            clientId: "nonguessable-temporary-client-id"
          }, additionalConfig !== void 0 ? { additionalConfig } : {})
        ];
      }
    }
  }
  const clients = [];
  let commonProviderConfig = {
    thirdPartyId
  };
  let isGetAuthorisationRedirectUrlOverridden = false;
  let isExchangeAuthCodeForOAuthTokensOverridden = false;
  let isGetUserInfoOverridden = false;
  for (const provider of mergedProvidersFromCoreAndStatic) {
    if (provider.config.thirdPartyId === thirdPartyId) {
      let foundCorrectConfig = false;
      for (const client of (_d = provider.config.clients) != null ? _d : []) {
        try {
          const providerInstance = await (0, import_configUtils.findAndCreateProviderInstance)(
            mergedProvidersFromCoreAndStatic,
            thirdPartyId,
            client.clientType,
            userContext
          );
          const _e = providerInstance.config, {
            clientId,
            clientSecret,
            clientType,
            scope,
            additionalConfig: additionalConfig2,
            forcePKCE
          } = _e, commonConfig = __objRest(_e, [
            "clientId",
            "clientSecret",
            "clientType",
            "scope",
            "additionalConfig",
            "forcePKCE"
          ]);
          clients.push({
            clientId,
            clientSecret,
            scope,
            clientType,
            additionalConfig: additionalConfig2,
            forcePKCE
          });
          commonProviderConfig = commonConfig;
          if (provider.override !== void 0) {
            const beforeOverride = __spreadValues({}, providerInstance);
            const afterOverride = provider.override(beforeOverride);
            if (beforeOverride.getAuthorisationRedirectURL !== afterOverride.getAuthorisationRedirectURL) {
              isGetAuthorisationRedirectUrlOverridden = true;
            }
            if (beforeOverride.exchangeAuthCodeForOAuthTokens !== afterOverride.exchangeAuthCodeForOAuthTokens) {
              isExchangeAuthCodeForOAuthTokensOverridden = true;
            }
            if (beforeOverride.getUserInfo !== afterOverride.getUserInfo) {
              isGetUserInfoOverridden = true;
            }
          }
          foundCorrectConfig = true;
        } catch (err) {
          clients.push(client);
        }
      }
      if (!foundCorrectConfig) {
        commonProviderConfig = provider.config;
      }
      break;
    }
  }
  if ((additionalConfig == null ? void 0 : additionalConfig.privateKey) !== void 0) {
    additionalConfig.privateKey = "";
  }
  const tempClients = clients.filter((client) => client.clientId === "nonguessable-temporary-client-id");
  const finalClients = clients.filter((client) => client.clientId !== "nonguessable-temporary-client-id");
  if (finalClients.length === 0) {
    finalClients.push(__spreadValues(__spreadProps(__spreadValues({}, tempClients[0]), {
      clientId: "",
      clientSecret: ""
    }), additionalConfig !== void 0 ? { additionalConfig } : {}));
  }
  if (thirdPartyId.startsWith("boxy-saml")) {
    const boxyAPIKey = options.req.getKeyValueFromQuery("boxyAPIKey");
    if (boxyAPIKey) {
      if (finalClients[0].clientId !== "") {
        const boxyURL = (_f = finalClients[0].additionalConfig) == null ? void 0 : _f.boxyURL;
        const normalisedDomain = new import_normalisedURLDomain.default(boxyURL);
        const normalisedBasePath = new import_normalisedURLPath.default(boxyURL);
        const connectionsPath = new import_normalisedURLPath.default("/api/v1/saml/config");
        const resp = await (0, import_utils.doGetRequest)(
          normalisedDomain.getAsStringDangerous() + normalisedBasePath.appendPath(connectionsPath).getAsStringDangerous(),
          {
            clientID: finalClients[0].clientId
          },
          {
            Authorization: `Api-Key ${boxyAPIKey}`
          }
        );
        if (resp.status === 200) {
          if (resp.jsonResponse === void 0) {
            throw new Error("should never happen");
          }
          finalClients[0].additionalConfig = __spreadProps(__spreadValues({}, finalClients[0].additionalConfig), {
            redirectURLs: resp.jsonResponse.redirectUrl,
            boxyTenant: resp.jsonResponse.tenant,
            boxyProduct: resp.jsonResponse.product
          });
        }
      }
    }
  }
  return {
    status: "OK",
    providerConfig: __spreadProps(__spreadValues({}, commonProviderConfig), {
      clients: finalClients,
      isGetAuthorisationRedirectUrlOverridden,
      isExchangeAuthCodeForOAuthTokensOverridden,
      isGetUserInfoOverridden
    })
  };
}
