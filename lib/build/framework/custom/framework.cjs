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
  CollectingResponse: () => CollectingResponse,
  CustomFrameworkWrapper: () => CustomFrameworkWrapper,
  PreParsedRequest: () => PreParsedRequest,
  errorHandler: () => errorHandler,
  middleware: () => middleware
});
module.exports = __toCommonJS(framework_exports);
var import_utils = require("../../utils");
var import_request = require("../request");
var import_response = require("../response");
var import_supertokens = __toESM(require("../../supertokens"), 1);
var import_nodeHeaders = __toESM(require("./nodeHeaders"), 1);
class PreParsedRequest extends import_request.BaseRequest {
  constructor(request) {
    super();
    this.getJSONFromRequestBody = () => {
      return this.request.getJSONBody();
    };
    this.getFormDataFromRequestBody = () => {
      return this.request.getFormBody();
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
      return this.request.cookies[key];
    };
    this.getHeaderValue = (key) => {
      var _a;
      return (_a = this.request.headers.get(key)) != null ? _a : void 0;
    };
    this.getOriginalURL = () => {
      return this.request.url;
    };
    this.original = request;
    this.request = request;
  }
  get session() {
    return this._session;
  }
  set session(value) {
    this._session = value;
    if (value !== void 0 && this.request.setSession !== void 0) {
      this.request.setSession(value);
    }
  }
}
class CollectingResponse extends import_response.BaseResponse {
  constructor() {
    super();
    this.sendHTMLResponse = (html) => {
      this.headers.set("Content-Type", "text/html");
      this.body = html;
    };
    this.setHeader = (key, value, allowDuplicateKey) => {
      var _a;
      if (allowDuplicateKey) {
        if (!((_a = this.headers.get(key)) == null ? void 0 : _a.includes(value))) {
          this.headers.append(key, value);
        }
      } else {
        this.headers.set(key, value);
      }
    };
    this.removeHeader = (key) => {
      this.headers.delete(key);
    };
    this.setCookie = (key, value, domain, secure, httpOnly, expires, path, sameSite) => {
      this.cookies.push({ key, value, domain, secure, httpOnly, expires, path, sameSite });
    };
    /**
     * @param {number} statusCode
     */
    this.setStatusCode = (statusCode) => {
      this.statusCode = statusCode;
    };
    this.sendJSONResponse = (content) => {
      this.headers.set("Content-Type", "application/json");
      this.body = JSON.stringify(content);
    };
    if (typeof Headers === "undefined") {
      this.headers = new import_nodeHeaders.default(null);
    } else {
      this.headers = new Headers();
    }
    this.statusCode = 200;
    this.cookies = [];
  }
}
const identity = (i) => i;
const middleware = (wrapRequest = identity, wrapResponse = identity) => {
  return async (request, response, next) => {
    const wrappedReq = wrapRequest(request);
    const wrappedResp = wrapResponse(response);
    let supertokens;
    const userContext = (0, import_utils.makeDefaultUserContextFromAPI)(wrappedReq);
    try {
      supertokens = import_supertokens.default.getInstanceOrThrowError();
      const result = await supertokens.middleware(wrappedReq, wrappedResp, userContext);
      if (!result) {
        if (next) {
          next();
        }
        return { handled: false };
      }
      return { handled: true };
    } catch (err) {
      if (supertokens) {
        try {
          await supertokens.errorHandler(err, wrappedReq, wrappedResp, userContext);
          return { handled: true };
        } catch (e) {
          if (next) {
            next(err);
          }
          return { error: err };
        }
      } else {
        if (next) {
          next(err);
        }
        return { error: err };
      }
    }
  };
};
const errorHandler = () => {
  return async (err, request, response, next) => {
    let supertokens = import_supertokens.default.getInstanceOrThrowError();
    const userContext = (0, import_utils.makeDefaultUserContextFromAPI)(request);
    try {
      await supertokens.errorHandler(err, request, response, userContext);
      return next();
    } catch (err2) {
      return next(err2);
    }
  };
};
const CustomFrameworkWrapper = {
  middleware,
  errorHandler
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CollectingResponse,
  CustomFrameworkWrapper,
  PreParsedRequest,
  errorHandler,
  middleware
});
