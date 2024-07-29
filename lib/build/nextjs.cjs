"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
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
var nextjs_exports = {};
__export(nextjs_exports, {
  default: () => NextJS,
  getAppDirRequestHandler: () => getAppDirRequestHandler,
  getSSRSession: () => getSSRSession,
  superTokensNextWrapper: () => superTokensNextWrapper,
  withPreParsedRequestResponse: () => withPreParsedRequestResponse,
  withSession: () => withSession
});
module.exports = __toCommonJS(nextjs_exports);
var import_cookie = require("cookie");
var import_express = require("./framework/express");
var import_utils = require("./utils");
var import_custom = require("./framework/custom");
var import_session = __toESM(require("./recipe/session"), 1);
var import_recipe = __toESM(require("./recipe/session/recipe"), 1);
var import_cookieAndHeaders = require("./recipe/session/cookieAndHeaders");
var import_constants = require("./recipe/session/constants");
var import_jwt = require("./recipe/session/jwt");
function next(request, response, resolve, reject) {
  return async function(middlewareError) {
    if (middlewareError === void 0) {
      return resolve();
    }
    await (0, import_express.errorHandler)()(middlewareError, request, response, (errorHandlerError) => {
      if (errorHandlerError !== void 0) {
        return reject(errorHandlerError);
      }
    });
  };
}
class NextJS {
  static async superTokensNextWrapper(middleware2, request, response) {
    return new Promise(async (resolve, reject) => {
      try {
        let callbackCalled = false;
        const result = await middleware2((err) => {
          callbackCalled = true;
          next(request, response, resolve, reject)(err);
        });
        if (!callbackCalled && !response.finished && !response.headersSent) {
          return resolve(result);
        }
      } catch (err) {
        await (0, import_express.errorHandler)()(err, request, response, (errorHandlerError) => {
          if (errorHandlerError !== void 0) {
            return reject(errorHandlerError);
          }
        });
      }
    });
  }
  static getAppDirRequestHandler(NextResponse) {
    const stMiddleware = (0, import_custom.middleware)((req) => {
      const query = Object.fromEntries(new URL(req.url).searchParams.entries());
      const cookies = Object.fromEntries(
        req.cookies.getAll().map((cookie) => [cookie.name, cookie.value])
      );
      return new import_custom.PreParsedRequest({
        method: req.method,
        url: req.url,
        query,
        headers: req.headers,
        cookies,
        getFormBody: () => req.formData(),
        getJSONBody: () => req.json()
      });
    });
    return async function handleCall(req) {
      const baseResponse = new import_custom.CollectingResponse();
      const { handled, error } = await stMiddleware(req, baseResponse);
      if (error) {
        throw error;
      }
      if (!handled) {
        return new NextResponse("Not found", { status: 404 });
      }
      for (const respCookie of baseResponse.cookies) {
        baseResponse.headers.append(
          "Set-Cookie",
          (0, import_cookie.serialize)(respCookie.key, respCookie.value, {
            domain: respCookie.domain,
            expires: new Date(respCookie.expires),
            httpOnly: respCookie.httpOnly,
            path: respCookie.path,
            sameSite: respCookie.sameSite,
            secure: respCookie.secure
          })
        );
      }
      return new NextResponse(baseResponse.body, {
        headers: baseResponse.headers,
        status: baseResponse.statusCode
      });
    };
  }
  static async commonSSRSession(baseRequest, options, userContext) {
    let baseResponse = new import_custom.CollectingResponse();
    const recipe = import_recipe.default.getInstanceOrThrowError();
    const tokenTransferMethod = recipe.config.getTokenTransferMethod({
      req: baseRequest,
      forCreateNewSession: false,
      userContext
    });
    const transferMethods = tokenTransferMethod === "any" ? import_constants.availableTokenTransferMethods : [tokenTransferMethod];
    const hasToken = transferMethods.some((transferMethod) => {
      const token = (0, import_cookieAndHeaders.getToken)(baseRequest, "access", transferMethod);
      if (!token) {
        return false;
      }
      try {
        (0, import_jwt.parseJWTWithoutSignatureVerification)(token);
        return true;
      } catch (e) {
        return false;
      }
    });
    try {
      let session = await import_session.default.getSession(baseRequest, baseResponse, options, userContext);
      return {
        session,
        hasInvalidClaims: false,
        hasToken,
        baseResponse
      };
    } catch (err) {
      if (import_session.default.Error.isErrorFromSuperTokens(err)) {
        return {
          hasToken,
          hasInvalidClaims: err.type === import_session.default.Error.INVALID_CLAIMS,
          session: void 0,
          baseResponse,
          nextResponse: new Response("Authentication required", {
            status: err.type === import_session.default.Error.INVALID_CLAIMS ? 403 : 401
          })
        };
      } else {
        throw err;
      }
    }
  }
  static async getSSRSession(cookies, headers, options, userContext) {
    let cookiesObj = Object.fromEntries(
      cookies.map((cookie) => [cookie.name, cookie.value])
    );
    let baseRequest = new import_custom.PreParsedRequest({
      method: "get",
      url: "",
      query: {},
      headers,
      cookies: cookiesObj,
      getFormBody: async () => [],
      getJSONBody: async () => []
    });
    const _a = await NextJS.commonSSRSession(
      baseRequest,
      options,
      (0, import_utils.getUserContext)(userContext)
    ), { baseResponse, nextResponse } = _a, result = __objRest(_a, ["baseResponse", "nextResponse"]);
    return result;
  }
  static async withSession(req, handler, options, userContext) {
    try {
      const query = Object.fromEntries(new URL(req.url).searchParams.entries());
      const cookies = Object.fromEntries(
        req.cookies.getAll().map((cookie) => [cookie.name, cookie.value])
      );
      let baseRequest = new import_custom.PreParsedRequest({
        method: req.method,
        url: req.url,
        query,
        headers: req.headers,
        cookies,
        getFormBody: () => req.formData(),
        getJSONBody: () => req.json()
      });
      const { session, nextResponse, baseResponse } = await NextJS.commonSSRSession(
        baseRequest,
        options,
        (0, import_utils.getUserContext)(userContext)
      );
      if (nextResponse) {
        return nextResponse;
      }
      let userResponse;
      try {
        userResponse = await handler(void 0, session);
      } catch (err) {
        await (0, import_custom.errorHandler)()(err, baseRequest, baseResponse, (errorHandlerError) => {
          if (errorHandlerError) {
            throw errorHandlerError;
          }
        });
        userResponse = new Response(baseResponse.body, {
          status: baseResponse.statusCode,
          headers: baseResponse.headers
        });
      }
      let didAddCookies = false;
      let didAddHeaders = false;
      for (const respCookie of baseResponse.cookies) {
        didAddCookies = true;
        userResponse.headers.append(
          "Set-Cookie",
          (0, import_cookie.serialize)(respCookie.key, respCookie.value, {
            domain: respCookie.domain,
            expires: new Date(respCookie.expires),
            httpOnly: respCookie.httpOnly,
            path: respCookie.path,
            sameSite: respCookie.sameSite,
            secure: respCookie.secure
          })
        );
      }
      baseResponse.headers.forEach((value, key) => {
        didAddHeaders = true;
        userResponse.headers.set(key, value);
      });
      if (didAddCookies || didAddHeaders) {
        if (!userResponse.headers.has("Cache-Control")) {
          userResponse.headers.set("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
        }
      }
      return userResponse;
    } catch (error) {
      return await handler(error, void 0);
    }
  }
  static async withPreParsedRequestResponse(req, handler) {
    const query = Object.fromEntries(new URL(req.url).searchParams.entries());
    const cookies = Object.fromEntries(
      req.cookies.getAll().map((cookie) => [cookie.name, cookie.value])
    );
    let baseRequest = new import_custom.PreParsedRequest({
      method: req.method,
      url: req.url,
      query,
      headers: req.headers,
      cookies,
      getFormBody: () => req.formData(),
      getJSONBody: () => req.json()
    });
    let baseResponse = new import_custom.CollectingResponse();
    let userResponse;
    try {
      userResponse = await handler(baseRequest, baseResponse);
    } catch (err) {
      await (0, import_custom.errorHandler)()(err, baseRequest, baseResponse, (errorHandlerError) => {
        if (errorHandlerError) {
          throw errorHandlerError;
        }
      });
      userResponse = new Response(baseResponse.body, {
        status: baseResponse.statusCode,
        headers: baseResponse.headers
      });
    }
    let didAddCookies = false;
    let didAddHeaders = false;
    for (const respCookie of baseResponse.cookies) {
      didAddCookies = true;
      userResponse.headers.append(
        "Set-Cookie",
        (0, import_cookie.serialize)(respCookie.key, respCookie.value, {
          domain: respCookie.domain,
          expires: new Date(respCookie.expires),
          httpOnly: respCookie.httpOnly,
          path: respCookie.path,
          sameSite: respCookie.sameSite,
          secure: respCookie.secure
        })
      );
    }
    baseResponse.headers.forEach((value, key) => {
      didAddHeaders = true;
      userResponse.headers.set(key, value);
    });
    if (didAddCookies || didAddHeaders) {
      if (!userResponse.headers.has("Cache-Control")) {
        userResponse.headers.set("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
      }
    }
    return userResponse;
  }
}
let superTokensNextWrapper = NextJS.superTokensNextWrapper;
let getAppDirRequestHandler = NextJS.getAppDirRequestHandler;
let getSSRSession = NextJS.getSSRSession;
let withSession = NextJS.withSession;
let withPreParsedRequestResponse = NextJS.withPreParsedRequestResponse;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getAppDirRequestHandler,
  getSSRSession,
  superTokensNextWrapper,
  withPreParsedRequestResponse,
  withSession
});
