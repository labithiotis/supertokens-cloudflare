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
var querier_exports = {};
__export(querier_exports, {
  Querier: () => Querier
});
module.exports = __toCommonJS(querier_exports);
var import_utils = require("./utils");
var import_version = require("./version");
var import_normalisedURLPath = __toESM(require("./normalisedURLPath"), 1);
var import_processState = require("./processState");
var import_constants = require("./constants");
var import_logger = require("./logger");
var import_supertokens = __toESM(require("./supertokens"), 1);
var import_node_process = require("node:process");
const _Querier = class _Querier {
  // we have rIdToCore so that recipes can force change the rId sent to core. This is a hack until the core is able
  // to support multiple rIds per API
  constructor(hosts, rIdToCore) {
    this.getAPIVersion = async (userContext) => {
      var _a;
      if (_Querier.apiVersion !== void 0) {
        return _Querier.apiVersion;
      }
      import_processState.ProcessState.getInstance().addState(import_processState.PROCESS_STATE.CALLING_SERVICE_IN_GET_API_VERSION);
      const st = import_supertokens.default.getInstanceOrThrowError();
      const appInfo = st.appInfo;
      const request = st.getRequestFromUserContext(userContext);
      const queryParamsObj = {
        apiDomain: appInfo.apiDomain.getAsStringDangerous(),
        websiteDomain: appInfo.getOrigin({ request, userContext }).getAsStringDangerous()
      };
      const queryParams = new URLSearchParams(queryParamsObj).toString();
      let { body: response } = await this.sendRequestHelper(
        new import_normalisedURLPath.default("/apiversion"),
        "GET",
        async (url) => {
          let headers = {};
          if (_Querier.apiKey !== void 0) {
            headers = {
              "api-key": _Querier.apiKey
            };
          }
          if (_Querier.networkInterceptor !== void 0) {
            let request2 = _Querier.networkInterceptor(
              {
                url,
                method: "get",
                headers,
                params: queryParamsObj
              },
              userContext
            );
            url = request2.url;
            headers = request2.headers;
          }
          let response2 = await (0, import_utils.doFetch)(url + `?${queryParams}`, {
            method: "GET",
            headers
          });
          return response2;
        },
        ((_a = this.__hosts) == null ? void 0 : _a.length) || 0
      );
      let cdiSupportedByServer = response.versions;
      let supportedVersion = (0, import_utils.getLargestVersionFromIntersection)(cdiSupportedByServer, import_version.cdiSupported);
      if (supportedVersion === void 0) {
        throw Error(
          "The running SuperTokens core version is not compatible with this NodeJS SDK. Please visit https://supertokens.io/docs/community/compatibility to find the right versions"
        );
      }
      _Querier.apiVersion = supportedVersion;
      return _Querier.apiVersion;
    };
    this.getHostsAliveForTesting = () => {
      if (import_node_process.env.TEST_MODE !== "testing") {
        throw Error("calling testing function in non testing env");
      }
      return _Querier.hostsAliveForTesting;
    };
    // path should start with "/"
    this.sendPostRequest = async (path, body, userContext) => {
      var _a;
      this.invalidateCoreCallCache(userContext);
      const { body: respBody } = await this.sendRequestHelper(
        path,
        "POST",
        async (url) => {
          let apiVersion = await this.getAPIVersion(userContext);
          let headers = {
            "cdi-version": apiVersion,
            "content-type": "application/json; charset=utf-8"
          };
          if (_Querier.apiKey !== void 0) {
            headers = __spreadProps(__spreadValues({}, headers), {
              "api-key": _Querier.apiKey
            });
          }
          if (path.isARecipePath() && this.rIdToCore !== void 0) {
            headers = __spreadProps(__spreadValues({}, headers), {
              rid: this.rIdToCore
            });
          }
          if (_Querier.networkInterceptor !== void 0) {
            let request = _Querier.networkInterceptor(
              {
                url,
                method: "post",
                headers,
                body
              },
              userContext
            );
            url = request.url;
            headers = request.headers;
            if (request.body !== void 0) {
              body = request.body;
            }
          }
          return (0, import_utils.doFetch)(url, {
            method: "POST",
            body: body !== void 0 ? JSON.stringify(body) : void 0,
            headers
          });
        },
        ((_a = this.__hosts) == null ? void 0 : _a.length) || 0
      );
      return respBody;
    };
    // path should start with "/"
    this.sendDeleteRequest = async (path, body, params, userContext) => {
      var _a;
      this.invalidateCoreCallCache(userContext);
      const { body: respBody } = await this.sendRequestHelper(
        path,
        "DELETE",
        async (url) => {
          let apiVersion = await this.getAPIVersion(userContext);
          let headers = { "cdi-version": apiVersion, "content-type": "application/json; charset=utf-8" };
          if (_Querier.apiKey !== void 0) {
            headers = __spreadProps(__spreadValues({}, headers), {
              "api-key": _Querier.apiKey
            });
          }
          if (path.isARecipePath() && this.rIdToCore !== void 0) {
            headers = __spreadProps(__spreadValues({}, headers), {
              rid: this.rIdToCore
            });
          }
          if (_Querier.networkInterceptor !== void 0) {
            let request = _Querier.networkInterceptor(
              {
                url,
                method: "delete",
                headers,
                params,
                body
              },
              userContext
            );
            url = request.url;
            headers = request.headers;
            if (request.body !== void 0) {
              body = request.body;
            }
            if (request.params !== void 0) {
              params = request.params;
            }
          }
          const finalURL = new URL(url);
          const searchParams = new URLSearchParams(params);
          finalURL.search = searchParams.toString();
          return (0, import_utils.doFetch)(finalURL.toString(), {
            method: "DELETE",
            body: body !== void 0 ? JSON.stringify(body) : void 0,
            headers
          });
        },
        ((_a = this.__hosts) == null ? void 0 : _a.length) || 0
      );
      return respBody;
    };
    // path should start with "/"
    this.sendGetRequest = async (path, params, userContext) => {
      var _a;
      const { body: respBody } = await this.sendRequestHelper(
        path,
        "GET",
        async (url) => {
          var _a2, _b, _c, _d;
          let apiVersion = await this.getAPIVersion(userContext);
          let headers = { "cdi-version": apiVersion };
          if (_Querier.apiKey !== void 0) {
            headers = __spreadProps(__spreadValues({}, headers), {
              "api-key": _Querier.apiKey
            });
          }
          if (path.isARecipePath() && this.rIdToCore !== void 0) {
            headers = __spreadProps(__spreadValues({}, headers), {
              rid: this.rIdToCore
            });
          }
          const sortedKeys = Object.keys(params).sort();
          const sortedHeaderKeys = Object.keys(headers).sort();
          let uniqueKey = path.getAsStringDangerous();
          for (const key of sortedKeys) {
            const value = params[key];
            uniqueKey += `;${key}=${value}`;
          }
          uniqueKey += ";hdrs";
          for (const key of sortedHeaderKeys) {
            const value = headers[key];
            uniqueKey += `;${key}=${value}`;
          }
          if (((_a2 = userContext._default) == null ? void 0 : _a2.globalCacheTag) !== _Querier.globalCacheTag) {
            this.invalidateCoreCallCache(userContext, false);
          }
          if (!_Querier.disableCache && uniqueKey in ((_c = (_b = userContext._default) == null ? void 0 : _b.coreCallCache) != null ? _c : {})) {
            return userContext._default.coreCallCache[uniqueKey];
          }
          if (_Querier.networkInterceptor !== void 0) {
            let request = _Querier.networkInterceptor(
              {
                url,
                method: "get",
                headers,
                params
              },
              userContext
            );
            url = request.url;
            headers = request.headers;
            if (request.params !== void 0) {
              params = request.params;
            }
          }
          const finalURL = new URL(url);
          const searchParams = new URLSearchParams(
            Object.entries(params).filter(([_, value]) => value !== void 0)
          );
          finalURL.search = searchParams.toString();
          let response = await (0, import_utils.doFetch)(finalURL.toString(), {
            method: "GET",
            headers
          });
          if (response.status === 200 && !_Querier.disableCache) {
            userContext._default = __spreadProps(__spreadValues({}, userContext._default), {
              coreCallCache: __spreadProps(__spreadValues({}, (_d = userContext._default) == null ? void 0 : _d.coreCallCache), {
                [uniqueKey]: response
              }),
              globalCacheTag: _Querier.globalCacheTag
            });
          }
          return response;
        },
        ((_a = this.__hosts) == null ? void 0 : _a.length) || 0
      );
      return respBody;
    };
    this.sendGetRequestWithResponseHeaders = async (path, params, userContext) => {
      var _a;
      return await this.sendRequestHelper(
        path,
        "GET",
        async (url) => {
          let apiVersion = await this.getAPIVersion(userContext);
          let headers = { "cdi-version": apiVersion };
          if (_Querier.apiKey !== void 0) {
            headers = __spreadProps(__spreadValues({}, headers), {
              "api-key": _Querier.apiKey
            });
          }
          if (path.isARecipePath() && this.rIdToCore !== void 0) {
            headers = __spreadProps(__spreadValues({}, headers), {
              rid: this.rIdToCore
            });
          }
          if (_Querier.networkInterceptor !== void 0) {
            let request = _Querier.networkInterceptor(
              {
                url,
                method: "get",
                headers,
                params
              },
              userContext
            );
            url = request.url;
            headers = request.headers;
            if (request.params !== void 0) {
              params = request.params;
            }
          }
          const finalURL = new URL(url);
          const searchParams = new URLSearchParams(
            Object.entries(params).filter(([_, value]) => value !== void 0)
          );
          finalURL.search = searchParams.toString();
          return (0, import_utils.doFetch)(finalURL.toString(), {
            method: "GET",
            headers
          });
        },
        ((_a = this.__hosts) == null ? void 0 : _a.length) || 0
      );
    };
    // path should start with "/"
    this.sendPutRequest = async (path, body, userContext) => {
      var _a;
      this.invalidateCoreCallCache(userContext);
      const { body: respBody } = await this.sendRequestHelper(
        path,
        "PUT",
        async (url) => {
          let apiVersion = await this.getAPIVersion(userContext);
          let headers = { "cdi-version": apiVersion, "content-type": "application/json; charset=utf-8" };
          if (_Querier.apiKey !== void 0) {
            headers = __spreadProps(__spreadValues({}, headers), {
              "api-key": _Querier.apiKey
            });
          }
          if (path.isARecipePath() && this.rIdToCore !== void 0) {
            headers = __spreadProps(__spreadValues({}, headers), {
              rid: this.rIdToCore
            });
          }
          if (_Querier.networkInterceptor !== void 0) {
            let request = _Querier.networkInterceptor(
              {
                url,
                method: "put",
                headers,
                body
              },
              userContext
            );
            url = request.url;
            headers = request.headers;
            if (request.body !== void 0) {
              body = request.body;
            }
          }
          return (0, import_utils.doFetch)(url, {
            method: "PUT",
            body: body !== void 0 ? JSON.stringify(body) : void 0,
            headers
          });
        },
        ((_a = this.__hosts) == null ? void 0 : _a.length) || 0
      );
      return respBody;
    };
    this.invalidateCoreCallCache = (userContext, updGlobalCacheTagIfNecessary = true) => {
      var _a;
      if (updGlobalCacheTagIfNecessary && ((_a = userContext._default) == null ? void 0 : _a.keepCacheAlive) !== true) {
        _Querier.globalCacheTag = Date.now();
      }
      userContext._default = __spreadProps(__spreadValues({}, userContext._default), {
        coreCallCache: {}
      });
    };
    // path should start with "/"
    this.sendRequestHelper = async (path, method, requestFunc, numberOfTries, retryInfoMap) => {
      var _a;
      if (this.__hosts === void 0) {
        throw Error(
          "No SuperTokens core available to query. Please pass supertokens > connectionURI to the init function, or override all the functions of the recipe you are using."
        );
      }
      if (numberOfTries === 0) {
        throw Error("No SuperTokens core available to query");
      }
      let currentDomain = this.__hosts[_Querier.lastTriedIndex].domain.getAsStringDangerous();
      let currentBasePath = this.__hosts[_Querier.lastTriedIndex].basePath.getAsStringDangerous();
      const url = currentDomain + currentBasePath + path.getAsStringDangerous();
      const maxRetries = 5;
      if (retryInfoMap === void 0) {
        retryInfoMap = {};
      }
      if (retryInfoMap[url] === void 0) {
        retryInfoMap[url] = maxRetries;
      }
      _Querier.lastTriedIndex++;
      _Querier.lastTriedIndex = _Querier.lastTriedIndex % this.__hosts.length;
      try {
        import_processState.ProcessState.getInstance().addState(import_processState.PROCESS_STATE.CALLING_SERVICE_IN_REQUEST_HELPER);
        (0, import_logger.logDebugMessage)(`core-call: ${method} ${url}`);
        let response = await requestFunc(url);
        if (import_node_process.env.TEST_MODE === "testing") {
          _Querier.hostsAliveForTesting.add(currentDomain + currentBasePath);
        }
        if (response.status !== 200) {
          throw response;
        }
        if ((_a = response.headers.get("content-type")) == null ? void 0 : _a.startsWith("text")) {
          return { body: await response.clone().text(), headers: response.headers };
        }
        return { body: await response.clone().json(), headers: response.headers };
      } catch (error) {
        const err = error;
        if (err.message !== void 0 && (err.message.includes("Failed to fetch") || err.message.includes("fetch failed") || err.message.includes("ECONNREFUSED") || err.code === "ECONNREFUSED")) {
          return this.sendRequestHelper(path, method, requestFunc, numberOfTries - 1, retryInfoMap);
        }
        if ("status" in err && "text" in err) {
          if (err.status === import_constants.RATE_LIMIT_STATUS_CODE) {
            const retriesLeft = retryInfoMap[url];
            if (retriesLeft > 0) {
              retryInfoMap[url] = retriesLeft - 1;
              const attemptsMade = maxRetries - retriesLeft;
              const delay = 10 + 250 * attemptsMade;
              await new Promise((resolve) => setTimeout(resolve, delay));
              return this.sendRequestHelper(path, method, requestFunc, numberOfTries, retryInfoMap);
            }
          }
          throw new Error(
            "SuperTokens core threw an error for a " + method + " request to path: '" + path.getAsStringDangerous() + "' with status code: " + err.status + " and message: " + await err.text()
          );
        }
        throw err;
      }
    };
    this.__hosts = hosts;
    this.rIdToCore = rIdToCore;
  }
  static reset() {
    if (import_node_process.env.TEST_MODE !== "testing") {
      throw Error("calling testing function in non testing env");
    }
    _Querier.initCalled = false;
    _Querier.apiVersion = void 0;
  }
  static getNewInstanceOrThrowError(rIdToCore) {
    if (!_Querier.initCalled) {
      throw Error("Please call the supertokens.init function before using SuperTokens");
    }
    return new _Querier(_Querier.hosts, rIdToCore);
  }
  static init(hosts, apiKey, networkInterceptor, disableCache) {
    if (!_Querier.initCalled) {
      (0, import_logger.logDebugMessage)("querier initialized");
      _Querier.initCalled = true;
      _Querier.hosts = hosts;
      _Querier.apiKey = apiKey;
      _Querier.apiVersion = void 0;
      _Querier.lastTriedIndex = 0;
      _Querier.hostsAliveForTesting = /* @__PURE__ */ new Set();
      _Querier.networkInterceptor = networkInterceptor;
      _Querier.disableCache = disableCache != null ? disableCache : false;
    }
  }
  getAllCoreUrlsForPath(path) {
    if (this.__hosts === void 0) {
      return [];
    }
    const normalisedPath = new import_normalisedURLPath.default(path);
    return this.__hosts.map((h) => {
      const currentDomain = h.domain.getAsStringDangerous();
      const currentBasePath = h.basePath.getAsStringDangerous();
      return currentDomain + currentBasePath + normalisedPath.getAsStringDangerous();
    });
  }
};
_Querier.initCalled = false;
_Querier.hosts = void 0;
_Querier.apiKey = void 0;
_Querier.apiVersion = void 0;
_Querier.lastTriedIndex = 0;
_Querier.hostsAliveForTesting = /* @__PURE__ */ new Set();
_Querier.networkInterceptor = void 0;
_Querier.globalCacheTag = Date.now();
_Querier.disableCache = false;
let Querier = _Querier;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Querier
});
