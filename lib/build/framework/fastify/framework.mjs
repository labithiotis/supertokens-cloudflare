import { getFromObjectCaseInsensitive, makeDefaultUserContextFromAPI, normaliseHttpMethod } from "../../utils";
import { BaseRequest } from "../request";
import { BaseResponse } from "../response";
import { serializeCookieValue, normalizeHeaderValue, getCookieValueFromHeaders } from "../utils";
import SuperTokens from "../../supertokens";
import { COOKIE_HEADER } from "../constants";
class FastifyRequest extends BaseRequest {
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
      return normaliseHttpMethod(this.request.method);
    };
    this.getCookieValue = (key) => {
      return getCookieValueFromHeaders(this.request.headers, key);
    };
    this.getHeaderValue = (key) => {
      return normalizeHeaderValue(getFromObjectCaseInsensitive(key, this.request.headers));
    };
    this.getOriginalURL = () => {
      return this.request.url;
    };
    this.original = request;
    this.request = request;
  }
}
class FastifyResponse extends BaseResponse {
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
      let serialisedCookie = serializeCookieValue(key, value, domain, secure, httpOnly, expires, path, sameSite);
      let oldHeaders = this.response.getHeader(COOKIE_HEADER);
      if (oldHeaders === void 0) oldHeaders = [];
      else if (!(oldHeaders instanceof Array)) oldHeaders = [oldHeaders];
      this.response.removeHeader(COOKIE_HEADER);
      this.response.header(COOKIE_HEADER, [
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
    let supertokens = SuperTokens.getInstanceOrThrowError();
    let request = new FastifyRequest(req);
    let response = new FastifyResponse(reply);
    const userContext = makeDefaultUserContextFromAPI(request);
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
    let supertokens = SuperTokens.getInstanceOrThrowError();
    let request = new FastifyRequest(req);
    let response = new FastifyResponse(res);
    let userContext = makeDefaultUserContextFromAPI(request);
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
export {
  FastifyRequest,
  FastifyResponse,
  FastifyWrapper,
  errorHandler
};
