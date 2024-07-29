import { makeDefaultUserContextFromAPI, normaliseHttpMethod } from "../../utils";
import { BaseRequest } from "../request";
import { BaseResponse } from "../response";
import { getHeaderValueFromIncomingMessage, parseJSONBodyFromRequest, parseURLEncodedFormData } from "../utils";
import SuperTokens from "../../supertokens";
class KoaRequest extends BaseRequest {
  constructor(ctx) {
    super();
    this.getFormDataFromRequestBody = async () => {
      return parseURLEncodedFormData(this.ctx.req);
    };
    this.getJSONFromRequestBody = async () => {
      const parsedJSONBody = await parseJSONBodyFromRequest(this.ctx.req);
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
      return normaliseHttpMethod(this.ctx.request.method);
    };
    this.getCookieValue = (key) => {
      return this.ctx.cookies.get(key);
    };
    this.getHeaderValue = (key) => {
      return getHeaderValueFromIncomingMessage(this.ctx.req, key);
    };
    this.getOriginalURL = () => {
      return this.ctx.originalUrl;
    };
    this.original = ctx;
    this.ctx = ctx;
  }
}
class KoaResponse extends BaseResponse {
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
    let supertokens = SuperTokens.getInstanceOrThrowError();
    let request = new KoaRequest(ctx);
    let response = new KoaResponse(ctx);
    const userContext = makeDefaultUserContextFromAPI(request);
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
export {
  KoaRequest,
  KoaResponse,
  KoaWrapper,
  middleware
};
