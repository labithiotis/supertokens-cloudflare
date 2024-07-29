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
  KoaRequest: () => KoaRequest,
  KoaResponse: () => KoaResponse,
  KoaWrapper: () => KoaWrapper,
  middleware: () => middleware
});
module.exports = __toCommonJS(framework_exports);
var import_utils = require("../../utils");
var import_request = require("../request");
var import_response = require("../response");
var import_utils2 = require("../utils");
var import_supertokens = __toESM(require("../../supertokens"), 1);
class KoaRequest extends import_request.BaseRequest {
  constructor(ctx) {
    super();
    this.getFormDataFromRequestBody = async () => {
      return (0, import_utils2.parseURLEncodedFormData)(this.ctx.req);
    };
    this.getJSONFromRequestBody = async () => {
      const parsedJSONBody = await (0, import_utils2.parseJSONBodyFromRequest)(this.ctx.req);
      return parsedJSONBody === void 0 ? {} : parsedJSONBody;
    };
    this.getKeyValueFromQuery = (key) => {
      if (this.ctx.query === void 0) {
        return void 0;
      }
      let value = this.ctx.request.query[key];
      if (value === void 0 || typeof value !== "string") {
        return void 0;
      }
      return value;
    };
    this.getMethod = () => {
      return (0, import_utils.normaliseHttpMethod)(this.ctx.request.method);
    };
    this.getCookieValue = (key) => {
      return this.ctx.cookies.get(key);
    };
    this.getHeaderValue = (key) => {
      return (0, import_utils2.getHeaderValueFromIncomingMessage)(this.ctx.req, key);
    };
    this.getOriginalURL = () => {
      return this.ctx.originalUrl;
    };
    this.original = ctx;
    this.ctx = ctx;
  }
}
class KoaResponse extends import_response.BaseResponse {
  constructor(ctx) {
    super();
    this.responseSet = false;
    this.statusSet = false;
    this.sendHTMLResponse = (html) => {
      if (!this.responseSet) {
        this.ctx.set("content-type", "text/html");
        this.ctx.body = html;
        this.responseSet = true;
      }
    };
    this.setHeader = (key, value, allowDuplicateKey) => {
      try {
        let existingHeaders = this.ctx.response.headers;
        let existingValue = existingHeaders[key.toLowerCase()];
        if (existingValue === void 0) {
          this.ctx.set(key, value);
        } else if (allowDuplicateKey) {
          if (typeof existingValue !== "string" || !existingValue.includes(value)) {
            this.ctx.set(key, existingValue + ", " + value);
          }
        } else {
          this.ctx.set(key, value);
        }
      } catch (err) {
        throw new Error("Error while setting header with key: " + key + " and value: " + value);
      }
    };
    this.removeHeader = (key) => {
      this.ctx.remove(key);
    };
    this.setCookie = (key, value, domain, secure, httpOnly, expires, path, sameSite) => {
      this.ctx.cookies.set(key, value, {
        secure,
        sameSite,
        httpOnly,
        expires: new Date(expires),
        domain,
        path,
        overwrite: true
      });
    };
    /**
     * @param {number} statusCode
     */
    this.setStatusCode = (statusCode) => {
      if (!this.statusSet) {
        this.ctx.status = statusCode;
        this.statusSet = true;
      }
    };
    this.sendJSONResponse = (content) => {
      if (!this.responseSet) {
        this.ctx.body = content;
        this.responseSet = true;
      }
    };
    this.original = ctx;
    this.ctx = ctx;
  }
}
const middleware = () => {
  return async (ctx, next) => {
    let supertokens = import_supertokens.default.getInstanceOrThrowError();
    let request = new KoaRequest(ctx);
    let response = new KoaResponse(ctx);
    const userContext = (0, import_utils.makeDefaultUserContextFromAPI)(request);
    try {
      let result = await supertokens.middleware(request, response, userContext);
      if (!result) {
        return await next();
      }
    } catch (err) {
      return await supertokens.errorHandler(err, request, response, userContext);
    }
  };
};
const KoaWrapper = {
  middleware,
  wrapRequest: (unwrapped) => {
    return new KoaRequest(unwrapped);
  },
  wrapResponse: (unwrapped) => {
    return new KoaResponse(unwrapped);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  KoaRequest,
  KoaResponse,
  KoaWrapper,
  middleware
});
