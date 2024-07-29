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
var framework_exports = {};
__export(framework_exports, {
  HapiRequest: () => HapiRequest,
  HapiResponse: () => HapiResponse,
  HapiWrapper: () => HapiWrapper
});
module.exports = __toCommonJS(framework_exports);
var import_utils = require("../../utils");
var import_request = require("../request");
var import_response = require("../response");
var import_utils2 = require("../utils");
var import_supertokens = __toESM(require("../../supertokens"), 1);
class HapiRequest extends import_request.BaseRequest {
  constructor(request) {
    super();
    this.getFormDataFromRequestBody = async () => {
      return this.request.payload === void 0 || this.request.payload === null ? {} : this.request.payload;
    };
    this.getJSONFromRequestBody = async () => {
      return this.request.payload === void 0 || this.request.payload === null ? {} : this.request.payload;
    };
    this.getKeyValueFromQuery = (key) => {
      if (this.request.query === void 0) {
        return void 0;
      }
      let value = this.request.query[key];
      if (value === void 0 || typeof value !== "string") {
        return void 0;
      }
      return value;
    };
    this.getMethod = () => {
      return (0, import_utils.normaliseHttpMethod)(this.request.method);
    };
    this.getCookieValue = (key) => {
      return (0, import_utils2.getCookieValueFromHeaders)(this.request.headers, key);
    };
    this.getHeaderValue = (key) => {
      return (0, import_utils2.normalizeHeaderValue)(this.request.headers[key]);
    };
    this.getOriginalURL = () => {
      return this.request.url.toString();
    };
    this.original = request;
    this.request = request;
  }
}
class HapiResponse extends import_response.BaseResponse {
  constructor(response) {
    super();
    this.statusSet = false;
    this.sendHTMLResponse = (html) => {
      if (!this.responseSet) {
        this.content = html;
        this.setHeader("Content-Type", "text/html", false);
        this.responseSet = true;
      }
    };
    this.setHeader = (key, value, allowDuplicateKey) => {
      try {
        this.response.lazyHeaderBindings(this.response, key, value, allowDuplicateKey);
      } catch (err) {
        throw new Error("Error while setting header with key: " + key + " and value: " + value);
      }
    };
    this.removeHeader = (key) => {
      this.response.lazyHeaderBindings(this.response, key, void 0, false);
    };
    this.setCookie = (key, value, domain, secure, httpOnly, expires, path, sameSite) => {
      let now = Date.now();
      const cookieOptions = {
        isHttpOnly: httpOnly,
        isSecure: secure,
        path,
        domain,
        ttl: expires - now,
        isSameSite: sameSite === "lax" ? "Lax" : sameSite === "none" ? "None" : "Strict"
      };
      if (expires > now) {
        this.response.state(key, value, cookieOptions);
      } else {
        this.response.unstate(key, cookieOptions);
      }
    };
    /**
     * @param {number} statusCode
     */
    this.setStatusCode = (statusCode) => {
      if (!this.statusSet) {
        this.statusCode = statusCode;
        this.statusSet = true;
      }
    };
    /**
     * @param {any} content
     */
    this.sendJSONResponse = (content) => {
      if (!this.responseSet) {
        this.content = content;
        this.responseSet = true;
      }
    };
    this.sendResponse = (overwriteHeaders = false) => {
      if (!overwriteHeaders) {
        return this.response.response(this.content).code(this.statusCode).takeover();
      }
      return this.response.response(this.content).code(this.statusCode);
    };
    this.original = response;
    this.response = response;
    this.statusCode = 200;
    this.content = null;
    this.responseSet = false;
  }
}
const plugin = {
  name: "supertokens-hapi-middleware",
  version: "1.0.0",
  register: async function(server, _) {
    let supertokens = import_supertokens.default.getInstanceOrThrowError();
    server.ext("onPreHandler", async (req, h) => {
      let request = new HapiRequest(req);
      let response = new HapiResponse(h);
      const userContext = (0, import_utils.makeDefaultUserContextFromAPI)(request);
      let result = await supertokens.middleware(request, response, userContext);
      if (!result) {
        return h.continue;
      }
      return response.sendResponse();
    });
    server.ext("onPreResponse", async (request, h) => {
      (request.app.lazyHeaders || []).forEach(({ key, value, allowDuplicateKey }) => {
        if (request.response.isBoom) {
          request.response.output.headers[key] = value;
        } else {
          request.response.header(key, value, { append: allowDuplicateKey });
        }
      });
      if (request.response.isBoom) {
        let err = request.response.data || request.response;
        let req = new HapiRequest(request);
        let res = new HapiResponse(h);
        const userContext = (0, import_utils.makeDefaultUserContextFromAPI)(req);
        if (err !== void 0 && err !== null) {
          try {
            await supertokens.errorHandler(err, req, res, userContext);
            if (res.responseSet) {
              let resObj = res.sendResponse(true);
              (request.app.lazyHeaders || []).forEach(({ key, value, allowDuplicateKey }) => {
                resObj.header(key, value, { append: allowDuplicateKey });
              });
              return resObj.takeover();
            }
            return h.continue;
          } catch (e) {
            return h.continue;
          }
        }
      }
      return h.continue;
    });
    server.decorate("toolkit", "lazyHeaderBindings", function(h, key, value, allowDuplicateKey) {
      const anyApp = h.request.app;
      anyApp.lazyHeaders = anyApp.lazyHeaders || [];
      if (value === void 0) {
        anyApp.lazyHeaders = anyApp.lazyHeaders.filter(
          (header) => header.key.toLowerCase() !== key.toLowerCase()
        );
      } else {
        anyApp.lazyHeaders.push({ key, value, allowDuplicateKey });
      }
    });
    let supportedRoutes = [];
    let methodsSupported = /* @__PURE__ */ new Set();
    for (let i = 0; i < supertokens.recipeModules.length; i++) {
      let apisHandled = supertokens.recipeModules[i].getAPIsHandled();
      for (let j = 0; j < apisHandled.length; j++) {
        let api = apisHandled[j];
        if (!api.disabled) {
          methodsSupported.add(api.method);
        }
      }
    }
    supportedRoutes.push({
      path: `${supertokens.appInfo.apiBasePath.getAsStringDangerous()}/{path*}`,
      method: [...methodsSupported],
      handler: (_2, h) => {
        return h.continue;
      }
    });
    server.route(supportedRoutes);
  }
};
const HapiWrapper = {
  plugin,
  wrapRequest: (unwrapped) => {
    return new HapiRequest(unwrapped);
  },
  wrapResponse: (unwrapped) => {
    return new HapiResponse(unwrapped);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HapiRequest,
  HapiResponse,
  HapiWrapper
});
