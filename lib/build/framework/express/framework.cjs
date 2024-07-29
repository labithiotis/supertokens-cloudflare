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
  ExpressRequest: () => ExpressRequest,
  ExpressResponse: () => ExpressResponse,
  ExpressWrapper: () => ExpressWrapper,
  errorHandler: () => errorHandler,
  middleware: () => middleware
});
module.exports = __toCommonJS(framework_exports);
var import_utils = require("../../utils");
var import_request = require("../request");
var import_response = require("../response");
var import_utils2 = require("../utils");
var import_supertokens = __toESM(require("../../supertokens"), 1);
var import_node_buffer = require("node:buffer");
class ExpressRequest extends import_request.BaseRequest {
  constructor(request) {
    super();
    this.getFormDataFromRequestBody = async () => {
      await (0, import_utils2.assertFormDataBodyParserHasBeenUsedForExpressLikeRequest)(this.request);
      return this.request.body;
    };
    this.getJSONFromRequestBody = async () => {
      await (0, import_utils2.assertThatBodyParserHasBeenUsedForExpressLikeRequest)(this.getMethod(), this.request);
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
      return (0, import_utils2.getCookieValueFromIncomingMessage)(this.request, key);
    };
    this.getHeaderValue = (key) => {
      return (0, import_utils2.getHeaderValueFromIncomingMessage)(this.request, key);
    };
    this.getOriginalURL = () => {
      return this.request.originalUrl || this.request.url;
    };
    this.original = request;
    this.request = request;
  }
}
class ExpressResponse extends import_response.BaseResponse {
  constructor(response) {
    super();
    this.sendHTMLResponse = (html) => {
      if (!this.response.writableEnded) {
        this.response.setHeader("Content-Type", "text/html");
        this.response.status(this.statusCode).send(import_node_buffer.Buffer.from(html));
      }
    };
    this.setHeader = (key, value, allowDuplicateKey) => {
      (0, import_utils2.setHeaderForExpressLikeResponse)(this.response, key, value, allowDuplicateKey);
    };
    this.removeHeader = (key) => {
      this.response.removeHeader(key);
    };
    this.setCookie = (key, value, domain, secure, httpOnly, expires, path, sameSite) => {
      (0, import_utils2.setCookieForServerResponse)(this.response, key, value, domain, secure, httpOnly, expires, path, sameSite);
    };
    /**
     * @param {number} statusCode
     */
    this.setStatusCode = (statusCode) => {
      if (!this.response.writableEnded) {
        this.statusCode = statusCode;
      }
    };
    this.sendJSONResponse = (content) => {
      if (!this.response.writableEnded) {
        this.response.status(this.statusCode).json(content);
      }
    };
    this.original = response;
    this.response = response;
    this.statusCode = 200;
  }
}
const middleware = () => {
  return async (req, res, next) => {
    let supertokens;
    const request = new ExpressRequest(req);
    const response = new ExpressResponse(res);
    const userContext = (0, import_utils.makeDefaultUserContextFromAPI)(request);
    try {
      supertokens = import_supertokens.default.getInstanceOrThrowError();
      const result = await supertokens.middleware(request, response, userContext);
      if (!result) {
        return next();
      }
    } catch (err) {
      if (supertokens) {
        try {
          await supertokens.errorHandler(err, request, response, userContext);
        } catch (e) {
          next(err);
        }
      } else {
        next(err);
      }
    }
  };
};
const errorHandler = () => {
  return async (err, req, res, next) => {
    let supertokens = import_supertokens.default.getInstanceOrThrowError();
    let request = new ExpressRequest(req);
    let response = new ExpressResponse(res);
    const userContext = (0, import_utils.makeDefaultUserContextFromAPI)(request);
    try {
      await supertokens.errorHandler(err, request, response, userContext);
    } catch (err2) {
      return next(err2);
    }
  };
};
const ExpressWrapper = {
  middleware,
  errorHandler,
  wrapRequest: (unwrapped) => {
    return new ExpressRequest(unwrapped);
  },
  wrapResponse: (unwrapped) => {
    return new ExpressResponse(unwrapped);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ExpressRequest,
  ExpressResponse,
  ExpressWrapper,
  errorHandler,
  middleware
});
