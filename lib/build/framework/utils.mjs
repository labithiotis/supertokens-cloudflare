var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __forAwait = (obj, it, method) => (it = obj[__knownSymbol("asyncIterator")]) ? it.call(obj) : (obj = obj[__knownSymbol("iterator")](), it = {}, method = (key, fn) => (fn = obj[key]) && (it[key] = (arg) => new Promise((yes, no, done) => (arg = fn.call(obj, arg), done = arg.done, Promise.resolve(arg.value).then((value) => yes({ value, done }), no)))), method("next"), method("return"), it);
import { parse, serialize } from "cookie";
import STError from "../error";
import { COOKIE_HEADER } from "./constants";
import { getFromObjectCaseInsensitive } from "../utils";
import contentType from "content-type";
import pako from "pako";
import { Buffer as Buffer2 } from "node:buffer";
async function inflate(stream) {
  if (!stream) {
    throw new TypeError("argument stream is required");
  }
  const encoding = stream.headers && stream.headers["content-encoding"];
  let i = new pako.Inflate();
  try {
    for (var iter = __forAwait(stream), more, temp, error; more = !(temp = await iter.next()).done; more = false) {
      const chunk = temp.value;
      i.push(Buffer2.from(chunk));
    }
  } catch (temp) {
    error = [temp];
  } finally {
    try {
      more && (temp = iter.return) && await temp.call(iter);
    } finally {
      if (error)
        throw error[0];
    }
  }
  if (typeof i.result === "string") {
    return i.result;
  } else {
    return new TextDecoder(encoding).decode(i.result, { stream: true });
  }
}
function getCookieValueFromHeaders(headers, key) {
  if (headers === void 0 || headers === null) {
    return void 0;
  }
  let cookies = headers.cookie || headers.Cookie;
  if (cookies === void 0) {
    return void 0;
  }
  cookies = parse(cookies);
  cookies = JSONCookies(cookies);
  return cookies[key];
}
function getCookieValueFromIncomingMessage(request, key) {
  if (request.cookies) {
    return request.cookies[key];
  }
  return getCookieValueFromHeaders(request.headers, key);
}
function getHeaderValueFromIncomingMessage(request, key) {
  return normalizeHeaderValue(getFromObjectCaseInsensitive(key, request.headers));
}
function normalizeHeaderValue(value) {
  if (value === void 0) {
    return void 0;
  }
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
function JSONCookie(str) {
  if (typeof str !== "string" || str.substr(0, 2) !== "j:") {
    return void 0;
  }
  try {
    return JSON.parse(str.slice(2));
  } catch (err) {
    return void 0;
  }
}
function JSONCookies(obj) {
  let cookies = Object.keys(obj);
  let key;
  let val;
  for (let i = 0; i < cookies.length; i++) {
    key = cookies[i];
    val = JSONCookie(obj[key]);
    if (val) {
      obj[key] = val;
    }
  }
  return obj;
}
function getCharset(req) {
  try {
    return (contentType.parse(req).parameters.charset || "").toLowerCase();
  } catch (e) {
    return void 0;
  }
}
async function parseJSONBodyFromRequest(req) {
  const encoding = getCharset(req) || "utf-8";
  if (!encoding.startsWith("utf-")) {
    throw new Error(`unsupported charset ${encoding.toUpperCase()}`);
  }
  const str = await inflate(req);
  if (str.length === 0) {
    return {};
  }
  return JSON.parse(str);
}
async function parseURLEncodedFormData(req) {
  const encoding = getCharset(req) || "utf-8";
  if (!encoding.startsWith("utf-")) {
    throw new Error(`unsupported charset ${encoding.toUpperCase()}`);
  }
  const str = await inflate(req);
  let body = {};
  for (const [key, val] of new URLSearchParams(str).entries()) {
    if (key in body) {
      if (body[key] instanceof Array) {
        body[key].push(val);
      } else {
        body[key] = [body[key], val];
      }
    } else {
      body[key] = val;
    }
  }
  return body;
}
async function assertThatBodyParserHasBeenUsedForExpressLikeRequest(method, request) {
  if (method === "post" || method === "put") {
    if (typeof request.body === "string") {
      try {
        request.body = JSON.parse(request.body);
      } catch (err) {
        if (request.body === "") {
          request.body = {};
        } else {
          throw new STError({
            type: STError.BAD_INPUT_ERROR,
            message: "API input error: Please make sure to pass a valid JSON input in the request body"
          });
        }
      }
    } else if (request.body === void 0 || Buffer2.isBuffer(request.body) || Object.keys(request.body).length === 0 && request.readable) {
      try {
        request.body = await parseJSONBodyFromRequest(request);
      } catch (e) {
        throw new STError({
          type: STError.BAD_INPUT_ERROR,
          message: "API input error: Please make sure to pass a valid JSON input in the request body"
        });
      }
    }
  }
}
async function assertFormDataBodyParserHasBeenUsedForExpressLikeRequest(request) {
  if (typeof request.body === "string") {
    try {
      request.body = Object.fromEntries(new URLSearchParams(request.body).entries());
    } catch (err) {
      if (request.body === "") {
        request.body = {};
      } else {
        throw new STError({
          type: STError.BAD_INPUT_ERROR,
          message: "API input error: Please make sure to pass valid url encoded form in the request body"
        });
      }
    }
  } else if (request.body === void 0 || Buffer2.isBuffer(request.body) || Object.keys(request.body).length === 0 && request.readable) {
    try {
      request.body = await parseURLEncodedFormData(request);
    } catch (e) {
      throw new STError({
        type: STError.BAD_INPUT_ERROR,
        message: "API input error: Please make sure to pass valid url encoded form in the request body"
      });
    }
  }
}
function setHeaderForExpressLikeResponse(res, key, value, allowDuplicateKey) {
  var _a;
  try {
    let existingHeaders = res.getHeaders();
    let existingValue = existingHeaders[key.toLowerCase()];
    if (existingValue === void 0) {
      if (res.header !== void 0) {
        res.header(key, value);
      } else {
        res.setHeader(key, value);
      }
    } else if (allowDuplicateKey) {
      if (typeof existingValue !== "string" || !existingValue.includes(value)) {
        if (res.header !== void 0) {
          res.header(key, existingValue + ", " + value);
        } else {
          res.setHeader(key, existingValue + ", " + value);
        }
      }
    } else {
      if (res.header !== void 0) {
        res.header(key, value);
      } else {
        res.setHeader(key, value);
      }
    }
  } catch (err) {
    throw new Error(
      "Error while setting header with key: " + key + " and value: " + value + "\nError: " + ((_a = err == null ? void 0 : err.message) != null ? _a : err)
    );
  }
}
function setCookieForServerResponse(res, key, value, domain, secure, httpOnly, expires, path, sameSite) {
  return appendToServerResponse(
    res,
    COOKIE_HEADER,
    serializeCookieValue(key, value, domain, secure, httpOnly, expires, path, sameSite),
    key
  );
}
function appendToServerResponse(res, field, val, key) {
  let prev = res.getHeader(field);
  res.setHeader(field, getCookieValueToSetInHeader(prev, val, key));
  return res;
}
function getCookieValueToSetInHeader(prev, val, key) {
  let value = val;
  if (prev !== void 0) {
    if (Array.isArray(prev)) {
      let removedDuplicate = [];
      for (let i = 0; i < prev.length; i++) {
        let curr = prev[i];
        if (!curr.startsWith(key)) {
          removedDuplicate.push(curr);
        }
      }
      prev = removedDuplicate;
    } else {
      if (prev.startsWith(key)) {
        prev = void 0;
      }
    }
    if (prev !== void 0) {
      value = Array.isArray(prev) ? prev.concat(val) : Array.isArray(val) ? [prev].concat(val) : [prev, val];
    }
  }
  value = Array.isArray(value) ? value.map(String) : String(value);
  return value;
}
function serializeCookieValue(key, value, domain, secure, httpOnly, expires, path, sameSite) {
  let opts = {
    domain,
    secure,
    httpOnly,
    expires: new Date(expires),
    path,
    sameSite
  };
  return serialize(key, value, opts);
}
export {
  assertFormDataBodyParserHasBeenUsedForExpressLikeRequest,
  assertThatBodyParserHasBeenUsedForExpressLikeRequest,
  getCookieValueFromHeaders,
  getCookieValueFromIncomingMessage,
  getCookieValueToSetInHeader,
  getHeaderValueFromIncomingMessage,
  normalizeHeaderValue,
  parseJSONBodyFromRequest,
  parseURLEncodedFormData,
  serializeCookieValue,
  setCookieForServerResponse,
  setHeaderForExpressLikeResponse
};
