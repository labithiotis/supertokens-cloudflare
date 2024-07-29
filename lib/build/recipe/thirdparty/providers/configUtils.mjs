var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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
import {
  ActiveDirectory,
  Apple,
  Bitbucket,
  BoxySAML,
  Discord,
  Facebook,
  Github,
  Gitlab,
  Google,
  GoogleWorkspaces,
  Linkedin,
  Okta,
  Twitter
} from ".";
import NewProvider from "./custom";
import { discoverOIDCEndpoints } from "./utils";
function getProviderConfigForClient(providerConfig, clientConfig) {
  return __spreadValues(__spreadValues({}, providerConfig), clientConfig);
}
async function fetchAndSetConfig(provider, clientType, userContext) {
  let config = await provider.getConfigForClientType({ clientType, userContext });
  await discoverOIDCEndpoints(config);
  Object.assign(provider.config, config);
}
function createProvider(input) {
  const clonedInput = __spreadValues({}, input);
  if (clonedInput.config.thirdPartyId.startsWith("active-directory")) {
    return ActiveDirectory(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("apple")) {
    return Apple(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("bitbucket")) {
    return Bitbucket(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("discord")) {
    return Discord(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("facebook")) {
    return Facebook(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("github")) {
    return Github(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("gitlab")) {
    return Gitlab(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("google-workspaces")) {
    return GoogleWorkspaces(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("google")) {
    return Google(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("okta")) {
    return Okta(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("linkedin")) {
    return Linkedin(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("twitter")) {
    return Twitter(clonedInput);
  } else if (clonedInput.config.thirdPartyId.startsWith("boxy-saml")) {
    return BoxySAML(clonedInput);
  }
  return NewProvider(clonedInput);
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
export {
  findAndCreateProviderInstance,
  getProviderConfigForClient,
  mergeConfig,
  mergeProvidersFromCoreAndStatic
};
