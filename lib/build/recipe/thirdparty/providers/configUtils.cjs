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
var configUtils_exports = {};
__export(configUtils_exports, {
  findAndCreateProviderInstance: () => findAndCreateProviderInstance,
  getProviderConfigForClient: () => getProviderConfigForClient,
  mergeConfig: () => mergeConfig,
  mergeProvidersFromCoreAndStatic: () => mergeProvidersFromCoreAndStatic
});
module.exports = __toCommonJS(configUtils_exports);
var import__ = require(".");
var import_custom = __toESM(require("./custom"), 1);
var import_utils = require("./utils");
function getProviderConfigForClient(providerConfig, clientConfig) {
  return __spreadValues(__spreadValues({}, providerConfig), clientConfig);
}
async function fetchAndSetConfig(provider, clientType, userContext) {
  let config = await provider.getConfigForClientType({ clientType, userContext });
  await (0, import_utils.discoverOIDCEndpoints)(config);
  Object.assign(provider.config, config);
}
function createProvider(input) {
  const clonedInput = __spreadValues({}, input);
  if (clonedInput.config.thirdPartyId.startsWith("active-directory")) {
    return (0, import__.ActiveDirectory)(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("apple")) {
    return (0, import__.Apple)(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("bitbucket")) {
    return (0, import__.Bitbucket)(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("discord")) {
    return (0, import__.Discord)(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("facebook")) {
    return (0, import__.Facebook)(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("github")) {
    return (0, import__.Github)(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("gitlab")) {
    return (0, import__.Gitlab)(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("google-workspaces")) {
    return (0, import__.GoogleWorkspaces)(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("google")) {
    return (0, import__.Google)(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("okta")) {
    return (0, import__.Okta)(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("linkedin")) {
    return (0, import__.Linkedin)(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("twitter")) {
    return (0, import__.Twitter)(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("boxy-saml")) {
    return (0, import__.BoxySAML)(clonedInput);
  }
  return (0, import_custom.default)(clonedInput);
}
async function findAndCreateProviderInstance(providers, thirdPartyId, clientType, userContext) {
  for (const providerInput of providers) {
    if (providerInput.config.thirdPartyId === thirdPartyId) {
      let providerInstance = createProvider(providerInput);
      await fetchAndSetConfig(providerInstance, clientType, userContext);
      return providerInstance;
    }
  }
  return void 0;
}
function mergeConfig(staticConfig, coreConfig) {
  var _a, _b, _c, _d;
  const result = __spreadProps(__spreadValues(__spreadValues({}, staticConfig), coreConfig), {
    userInfoMap: {
      fromIdTokenPayload: __spreadValues(__spreadValues({}, (_a = staticConfig.userInfoMap) == null ? void 0 : _a.fromIdTokenPayload), (_b = coreConfig.userInfoMap) == null ? void 0 : _b.fromIdTokenPayload),
      fromUserInfoAPI: __spreadValues(__spreadValues({}, (_c = staticConfig.userInfoMap) == null ? void 0 : _c.fromUserInfoAPI), (_d = coreConfig.userInfoMap) == null ? void 0 : _d.fromUserInfoAPI)
    }
  });
  const mergedClients = staticConfig.clients === void 0 ? [] : [...staticConfig.clients];
  const coreConfigClients = coreConfig.clients === void 0 ? [] : coreConfig.clients;
  for (const client of coreConfigClients) {
    const index = mergedClients.findIndex((c) => c.clientType === client.clientType);
    if (index === -1) {
      mergedClients.push(client);
    } else {
      mergedClients[index] = __spreadValues({}, client);
    }
  }
  result.clients = mergedClients;
  return result;
}
function mergeProvidersFromCoreAndStatic(providerConfigsFromCore, providerInputsFromStatic, includeAllProviders) {
  const mergedProviders = [];
  if (providerConfigsFromCore.length === 0) {
    for (const config of providerInputsFromStatic.filter(
      (config2) => config2.includeInNonPublicTenantsByDefault === true || includeAllProviders === true
    )) {
      mergedProviders.push(config);
    }
  } else {
    for (const providerConfigFromCore of providerConfigsFromCore) {
      let mergedProviderInput = {
        config: providerConfigFromCore
      };
      for (const providerInputFromStatic of providerInputsFromStatic) {
        if (providerInputFromStatic.config.thirdPartyId == providerConfigFromCore.thirdPartyId) {
          mergedProviderInput.config = mergeConfig(providerInputFromStatic.config, providerConfigFromCore);
          mergedProviderInput.override = providerInputFromStatic.override;
          break;
        }
      }
      mergedProviders.push(mergedProviderInput);
    }
  }
  return mergedProviders;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  findAndCreateProviderInstance,
  getProviderConfigForClient,
  mergeConfig,
  mergeProvidersFromCoreAndStatic
});
