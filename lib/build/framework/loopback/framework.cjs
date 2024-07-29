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
  LoopbackRequest: () => LoopbackRequest,
  LoopbackResponse: () => LoopbackResponse,
  LoopbackWrapper: () => LoopbackWrapper,
  middleware: () => middleware
});
module.exports = __toCommonJS(framework_exports);
var import_utils = require("../../utils");
var import_request = require("../request");
var import_response = require("../response");
var import_utils2 = require("../utils");
var import_supertokens = __toESM(require("../../supertokens"), 1);
var import_node_buffer = require("node:buffer");
class LoopbackRequest extends import_request.BaseRequest {
  constructor(ctx) {
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
      return this.request.originalUrl;
    };
    this.original = ctx.request;
    this.request = ctx.request;
  }
}
class LoopbackResponse extends import_response.BaseResponse {
  constructor(ctx) {
    super();
    this.sendHTMLResponse = (html) => {
      if (!this.response.writableEnded) {
        this.response.set("Content-Type", "text/html");
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
    this.original = ctx.response;
    this.response = ctx.response;
    this.statusCode = 200;
  }
}
const middleware = async (ctx, next) => {
  let supertokens = import_supertokens.default.getInstanceOrThrowError();
  let request = new LoopbackRequest(ctx);
  let response = new LoopbackResponse(ctx);
  const userContext = (0, import_utils.makeDefaultUserContextFromAPI)(request);
  try {
    let result = await supertokens.middleware(request, response, userContext);
    if (!result) {
      return await next();
    }
    return;
  } catch (err) {
    return await supertokens.errorHandler(err, request, response, userContext);
  }
};
const LoopbackWrapper = {
  middleware,
  wrapRequest: (unwrapped) => {
    return new LoopbackRequest(unwrapped);
  },
  wrapResponse: (unwrapped) => {
    return new LoopbackResponse(unwrapped);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LoopbackRequest,
  LoopbackResponse,
  LoopbackWrapper,
  middleware
});
