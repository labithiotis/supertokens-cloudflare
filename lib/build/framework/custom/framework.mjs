import { makeDefaultUserContextFromAPI, normaliseHttpMethod } from "../../utils";
import { BaseRequest } from "../request";
import { BaseResponse } from "../response";
import SuperTokens from "../../supertokens";
import NodeHeaders from "./nodeHeaders";
class PreParsedRequest extends BaseRequest {
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
      return normaliseHttpMethod(this.request.method);
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
class CollectingResponse extends BaseResponse {
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
      this.headers = new NodeHeaders(null);
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
    const userContext = makeDefaultUserContextFromAPI(wrappedReq);
    try {
      supertokens = SuperTokens.getInstanceOrThrowError();
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
    let supertokens = SuperTokens.getInstanceOrThrowError();
    const userContext = makeDefaultUserContextFromAPI(request);
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
export {
  CollectingResponse,
  CustomFrameworkWrapper,
  PreParsedRequest,
  errorHandler,
  middleware
};
