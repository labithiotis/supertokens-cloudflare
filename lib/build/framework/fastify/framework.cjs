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
  FastifyRequest: () => FastifyRequest,
  FastifyResponse: () => FastifyResponse,
  FastifyWrapper: () => FastifyWrapper,
  errorHandler: () => errorHandler
});
module.exports = __toCommonJS(framework_exports);
var import_utils = require("../../utils");
var import_request = require("../request");
var import_response = require("../response");
var import_utils2 = require("../utils");
var import_supertokens = __toESM(require("../../supertokens"), 1);
var import_constants = require("../constants");
class FastifyRequest extends import_request.BaseRequest {
  constructor(request) {
    super();
    this.getFormDataFromRequestBody = async () => {
      return this.request.body;
    };
    this.getJSONFromRequestBody = async () => {
      return this.request.body;
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
      return (0, import_utils2.normalizeHeaderValue)((0, import_utils.getFromObjectCaseInsensitive)(key, this.request.headers));
    };
    this.getOriginalURL = () => {
      return this.request.url;
    };
    this.original = request;
    this.request = request;
  }
}
class FastifyResponse extends import_response.BaseResponse {
  constructor(response) {
    super();
    this.sendHTMLResponse = (html) => {
      if (!this.response.sent) {
        this.response.type("text/html");
        this.response.send(html);
      }
    };
    this.setHeader = (key, value, allowDuplicateKey) => {
      try {
        let existingHeaders = this.response.getHeaders();
        let existingValue = existingHeaders[key.toLowerCase()];
        if (existingValue === void 0) {
          this.response.header(key, value);
        } else if (allowDuplicateKey) {
          if (typeof existingValue !== "string" || !existingValue.includes(value)) {
            this.response.header(key, existingValue + ", " + value);
          }
        } else {
          this.response.header(key, value);
        }
      } catch (err) {
        throw new Error("Error while setting header with key: " + key + " and value: " + value);
      }
    };
    this.removeHeader = (key) => {
      this.response.removeHeader(key);
    };
    this.setCookie = (key, value, domain, secure, httpOnly, expires, path, sameSite) => {
      let serialisedCookie = (0, import_utils2.serializeCookieValue)(key, value, domain, secure, httpOnly, expires, path, sameSite);
      let oldHeaders = this.response.getHeader(import_constants.COOKIE_HEADER);
      if (oldHeaders === void 0) oldHeaders = [];
      else if (!(oldHeaders instanceof Array)) oldHeaders = [oldHeaders];
      this.response.removeHeader(import_constants.COOKIE_HEADER);
      this.response.header(import_constants.COOKIE_HEADER, [
        ...oldHeaders.filter((h) => !h.startsWith(key + "=")),
        serialisedCookie
      ]);
    };
    /**
     * @param {number} statusCode
     */
    this.setStatusCode = (statusCode) => {
      if (!this.response.sent) {
        this.statusCode = statusCode;
      }
    };
    /**
     * @param {any} content
     */
    this.sendJSONResponse = (content) => {
      if (!this.response.sent) {
        this.response.statusCode = this.statusCode;
        this.response.send(content);
      }
    };
    this.original = response;
    this.response = response;
    this.statusCode = 200;
  }
}
function plugin(fastify, _, done) {
  fastify.addHook("preHandler", async (req, reply) => {
    let supertokens = import_supertokens.default.getInstanceOrThrowError();
    let request = new FastifyRequest(req);
    let response = new FastifyResponse(reply);
    const userContext = (0, import_utils.makeDefaultUserContextFromAPI)(request);
    try {
      await supertokens.middleware(request, response, userContext);
    } catch (err) {
      await supertokens.errorHandler(err, request, response, userContext);
    }
  });
  done();
}
plugin[Symbol.for("skip-override")] = true;
const errorHandler = () => {
  return async (err, req, res) => {
    let supertokens = import_supertokens.default.getInstanceOrThrowError();
    let request = new FastifyRequest(req);
    let response = new FastifyResponse(res);
    let userContext = (0, import_utils.makeDefaultUserContextFromAPI)(request);
    await supertokens.errorHandler(err, request, response, userContext);
  };
};
const FastifyWrapper = {
  plugin,
  errorHandler,
  wrapRequest: (unwrapped) => {
    return new FastifyRequest(unwrapped);
  },
  wrapResponse: (unwrapped) => {
    return new FastifyResponse(unwrapped);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FastifyRequest,
  FastifyResponse,
  FastifyWrapper,
  errorHandler
});
