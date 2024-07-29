var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
import { getFromObjectCaseInsensitive, makeDefaultUserContextFromAPI, normaliseHttpMethod } from "../../utils";
import { BaseRequest } from "../request";
import { BaseResponse } from "../response";
import { normalizeHeaderValue, getCookieValueFromHeaders, serializeCookieValue } from "../utils";
import { COOKIE_HEADER } from "../constants";
import SuperTokens from "../../supertokens";
import qs from "querystringify";
class AWSRequest extends BaseRequest {
  constructor(event) {
    super();
    this.getFormDataFromRequestBody = async () => {
      if (this.event.body === null || this.event.body === void 0) {
        return {};
      } else {
        const parsedUrlEncodedFormData = qs.parse(this.event.body);
        return parsedUrlEncodedFormData === void 0 ? {} : parsedUrlEncodedFormData;
      }
    };
    this.getJSONFromRequestBody = async () => {
      if (this.event.body === null || this.event.body === void 0) {
        return {};
      } else {
        const parsedJSONBody = JSON.parse(this.event.body);
        return parsedJSONBody === void 0 ? {} : parsedJSONBody;
      }
    };
    this.getKeyValueFromQuery = (key) => {
      if (this.event.queryStringParameters === void 0 || this.event.queryStringParameters === null) {
        return void 0;
      }
      let value = this.event.queryStringParameters[key];
      if (value === void 0 || typeof value !== "string") {
        return void 0;
      }
      return value;
    };
    this.getMethod = () => {
      let rawMethod = this.event.httpMethod;
      if (rawMethod !== void 0) {
        return normaliseHttpMethod(rawMethod);
      }
      return normaliseHttpMethod(this.event.requestContext.http.method);
    };
    this.getCookieValue = (key) => {
      let cookies = this.event.cookies;
      if ((this.event.headers === void 0 || this.event.headers === null) && (cookies === void 0 || cookies === null)) {
        return void 0;
      }
      let value = getCookieValueFromHeaders(this.event.headers, key);
      if (value === void 0 && cookies !== void 0 && cookies !== null) {
        value = getCookieValueFromHeaders(
          {
            cookie: cookies.join(";")
          },
          key
        );
      }
      return value;
    };
    this.getHeaderValue = (key) => {
      if (this.event.headers === void 0 || this.event.headers === null) {
        return void 0;
      }
      return normalizeHeaderValue(getFromObjectCaseInsensitive(key, this.event.headers));
    };
    this.getOriginalURL = () => {
      let path = this.event.path;
      let queryParams = this.event.queryStringParameters;
      if (path === void 0) {
        path = this.event.requestContext.http.path;
        let stage = this.event.requestContext.stage;
        if (stage !== void 0 && path.startsWith(`/${stage}`)) {
          path = path.slice(stage.length + 1);
        }
        if (queryParams !== void 0 && queryParams !== null) {
          let urlString = "https://exmaple.com" + path;
          let url = new URL(urlString);
          Object.keys(queryParams).forEach((el) => url.searchParams.append(el, queryParams[el]));
          path = url.pathname + url.search;
        }
      }
      return path;
    };
    this.original = event;
    this.event = event;
  }
}
class AWSResponse extends BaseResponse {
  constructor(event) {
    super();
    this.sendHTMLResponse = (html) => {
      if (!this.responseSet) {
        this.content = html;
        this.setHeader("Content-Type", "text/html", false);
        this.responseSet = true;
      }
    };
    this.setHeader = (key, value, allowDuplicateKey) => {
      this.event.supertokens.response.headers.push({
        key,
        value,
        allowDuplicateKey
      });
    };
    this.removeHeader = (key) => {
      this.event.supertokens.response.headers = this.event.supertokens.response.headers.filter(
        (header) => header.key.toLowerCase() !== key.toLowerCase()
      );
    };
    this.setCookie = (key, value, domain, secure, httpOnly, expires, path, sameSite) => {
      let serialisedCookie = serializeCookieValue(key, value, domain, secure, httpOnly, expires, path, sameSite);
      this.event.supertokens.response.cookies = [
        ...this.event.supertokens.response.cookies.filter((c) => !c.startsWith(key + "=")),
        serialisedCookie
      ];
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
    this.sendJSONResponse = (content) => {
      if (!this.responseSet) {
        this.content = JSON.stringify(content);
        this.setHeader("Content-Type", "application/json", false);
        this.responseSet = true;
      }
    };
    this.sendResponse = (response) => {
      if (response === void 0) {
        response = {};
      }
      let headers = response.headers;
      if (headers === void 0) {
        headers = {};
      }
      let body = response.body;
      let statusCode = response.statusCode;
      if (this.responseSet) {
        statusCode = this.statusCode;
        body = this.content;
      }
      let supertokensHeaders = this.event.supertokens.response.headers;
      let supertokensCookies = this.event.supertokens.response.cookies;
      for (let i = 0; i < supertokensHeaders.length; i++) {
        let currentValue = void 0;
        let currentHeadersSet = Object.keys(headers === void 0 ? [] : headers);
        for (let j = 0; j < currentHeadersSet.length; j++) {
          if (currentHeadersSet[j].toLowerCase() === supertokensHeaders[i].key.toLowerCase()) {
            supertokensHeaders[i].key = currentHeadersSet[j];
            currentValue = headers[currentHeadersSet[j]];
            break;
          }
        }
        if (supertokensHeaders[i].allowDuplicateKey && currentValue !== void 0) {
          if (typeof currentValue !== "string" || !currentValue.includes(supertokensHeaders[i].value.toString())) {
            let newValue = `${currentValue}, ${supertokensHeaders[i].value}`;
            headers[supertokensHeaders[i].key] = newValue;
          }
        } else {
          headers[supertokensHeaders[i].key] = supertokensHeaders[i].value;
        }
      }
      if (this.event.version !== void 0) {
        let cookies = response.cookies;
        if (cookies === void 0) {
          cookies = [];
        }
        cookies.push(...supertokensCookies);
        let result = __spreadProps(__spreadValues({}, response), {
          cookies,
          body,
          statusCode,
          headers
        });
        return result;
      } else {
        let multiValueHeaders = response.multiValueHeaders;
        if (multiValueHeaders === void 0) {
          multiValueHeaders = {};
        }
        let headsersInMultiValueHeaders = Object.keys(multiValueHeaders);
        let cookieHeader = headsersInMultiValueHeaders.find((h) => h.toLowerCase() === COOKIE_HEADER.toLowerCase());
        if (cookieHeader === void 0) {
          multiValueHeaders[COOKIE_HEADER] = supertokensCookies;
        } else {
          multiValueHeaders[cookieHeader].push(...supertokensCookies);
        }
        let result = __spreadProps(__spreadValues({}, response), {
          multiValueHeaders,
          body,
          statusCode,
          headers
        });
        return result;
      }
    };
    this.original = event;
    this.event = event;
    this.statusCode = 200;
    this.content = JSON.stringify({});
    this.responseSet = false;
    this.statusSet = false;
    this.event.supertokens = {
      response: {
        headers: [],
        cookies: []
      }
    };
  }
}
const middleware = (handler) => {
  return async (event, context, callback) => {
    let supertokens = SuperTokens.getInstanceOrThrowError();
    let request = new AWSRequest(event);
    let response = new AWSResponse(event);
    const userContext = makeDefaultUserContextFromAPI(request);
    try {
      let result = await supertokens.middleware(request, response, userContext);
      if (result) {
        return response.sendResponse();
      }
      if (handler !== void 0) {
        let handlerResult = await handler(event, context, callback);
        return response.sendResponse(handlerResult);
      }
      response.setStatusCode(404);
      response.sendJSONResponse({
        error: `The middleware couldn't serve the API path ${request.getOriginalURL()}, method: ${request.getMethod()}. If this is an unexpected behaviour, please create an issue here: https://github.com/supertokens/supertokens-node/issues`
      });
      return response.sendResponse();
    } catch (err) {
      await supertokens.errorHandler(err, request, response, userContext);
      if (response.responseSet) {
        return response.sendResponse();
      }
      throw err;
    }
  };
};
const AWSWrapper = {
  middleware,
  wrapRequest: (unwrapped) => {
    return new AWSRequest(unwrapped);
  },
  wrapResponse: (unwrapped) => {
    return new AWSResponse(unwrapped);
  }
};
export {
  AWSRequest,
  AWSResponse,
  AWSWrapper,
  middleware
};
