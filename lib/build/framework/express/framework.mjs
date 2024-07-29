import { makeDefaultUserContextFromAPI, normaliseHttpMethod } from "../../utils";
import { BaseRequest } from "../request";
import { BaseResponse } from "../response";
import {
  setCookieForServerResponse,
  setHeaderForExpressLikeResponse,
  getCookieValueFromIncomingMessage,
  getHeaderValueFromIncomingMessage,
  assertThatBodyParserHasBeenUsedForExpressLikeRequest,
  assertFormDataBodyParserHasBeenUsedForExpressLikeRequest
} from "../utils";
import SuperTokens from "../../supertokens";
import { Buffer } from "node:buffer";
class ExpressRequest extends BaseRequest {
  constructor(request) {
    super();
    this.getFormDataFromRequestBody = async () => {
      await assertFormDataBodyParserHasBeenUsedForExpressLikeRequest(this.request);
      return this.request.body;
    };
    this.getJSONFromRequestBody = async () => {
      await assertThatBodyParserHasBeenUsedForExpressLikeRequest(this.getMethod(), this.request);
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
      return normaliseHttpMethod(this.request.method);
    };
    this.getCookieValue = (key) => {
      return getCookieValueFromIncomingMessage(this.request, key);
    };
    this.getHeaderValue = (key) => {
      return getHeaderValueFromIncomingMessage(this.request, key);
    };
    this.getOriginalURL = () => {
      return this.request.originalUrl || this.request.url;
    };
    this.original = request;
    this.request = request;
  }
}
class ExpressResponse extends BaseResponse {
  constructor(response) {
    super();
    this.sendHTMLResponse = (html) => {
      if (!this.response.writableEnded) {
        this.response.setHeader("Content-Type", "text/html");
        this.response.status(this.statusCode).send(Buffer.from(html));
      }
    };
    this.setHeader = (key, value, allowDuplicateKey) => {
      setHeaderForExpressLikeResponse(this.response, key, value, allowDuplicateKey);
    };
    this.removeHeader = (key) => {
      this.response.removeHeader(key);
    };
    this.setCookie = (key, value, domain, secure, httpOnly, expires, path, sameSite) => {
      setCookieForServerResponse(this.response, key, value, domain, secure, httpOnly, expires, path, sameSite);
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
    const userContext = makeDefaultUserContextFromAPI(request);
    try {
      supertokens = SuperTokens.getInstanceOrThrowError();
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
    let supertokens = SuperTokens.getInstanceOrThrowError();
    let request = new ExpressRequest(req);
    let response = new ExpressResponse(res);
    const userContext = makeDefaultUserContextFromAPI(request);
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
export {
  ExpressRequest,
  ExpressResponse,
  ExpressWrapper,
  errorHandler,
  middleware
};
