var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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
import { serialize } from "cookie";
import { errorHandler } from "./framework/express";
import { getUserContext } from "./utils";
import {
  CollectingResponse,
  PreParsedRequest,
  middleware,
  errorHandler as customErrorHandler
} from "./framework/custom";
import Session from "./recipe/session";
import SessionRecipe from "./recipe/session/recipe";
import { getToken } from "./recipe/session/cookieAndHeaders";
import { availableTokenTransferMethods } from "./recipe/session/constants";
import { parseJWTWithoutSignatureVerification } from "./recipe/session/jwt";
function next(request, response, resolve, reject) {
  return async function(middlewareError) {
    if (middlewareError === void 0) {
      return resolve();
    }
    await errorHandler()(middlewareError, request, response, (errorHandlerError) => {
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
        await errorHandler()(err, request, response, (errorHandlerError) => {
          if (errorHandlerError !== void 0) {
            return reject(errorHandlerError);
          }
        });
      }
    });
  }
  static getAppDirRequestHandler(NextResponse) {
    const stMiddleware = middleware((req) => {
      const query = Object.fromEntries(new URL(req.url).searchParams.entries());
      const cookies = Object.fromEntries(
        req.cookies.getAll().map((cookie) => [cookie.name, cookie.value])
      );
      return new PreParsedRequest({
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
      const baseResponse = new CollectingResponse();
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
          serialize(respCookie.key, respCookie.value, {
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
    let baseResponse = new CollectingResponse();
    const recipe = SessionRecipe.getInstanceOrThrowError();
    const tokenTransferMethod = recipe.config.getTokenTransferMethod({
      req: baseRequest,
      forCreateNewSession: false,
      userContext
    });
    const transferMethods = tokenTransferMethod === "any" ? availableTokenTransferMethods : [tokenTransferMethod];
    const hasToken = transferMethods.some((transferMethod) => {
      const token = getToken(baseRequest, "access", transferMethod);
      if (!token) {
        return false;
      }
      try {
        parseJWTWithoutSignatureVerification(token);
        return true;
      } catch (e) {
        return false;
      }
    });
    try {
      let session = await Session.getSession(baseRequest, baseResponse, options, userContext);
      return {
        session,
        hasInvalidClaims: false,
        hasToken,
        baseResponse
      };
    } catch (err) {
      if (Session.Error.isErrorFromSuperTokens(err)) {
        return {
          hasToken,
          hasInvalidClaims: err.type === Session.Error.INVALID_CLAIMS,
          session: void 0,
          baseResponse,
          nextResponse: new Response("Authentication required", {
            status: err.type === Session.Error.INVALID_CLAIMS ? 403 : 401
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
    let baseRequest = new PreParsedRequest({
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
      getUserContext(userContext)
    ), { baseResponse, nextResponse } = _a, result = __objRest(_a, ["baseResponse", "nextResponse"]);
    return result;
  }
  static async withSession(req, handler, options, userContext) {
    try {
      const query = Object.fromEntries(new URL(req.url).searchParams.entries());
      const cookies = Object.fromEntries(
        req.cookies.getAll().map((cookie) => [cookie.name, cookie.value])
      );
      let baseRequest = new PreParsedRequest({
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
        getUserContext(userContext)
      );
      if (nextResponse) {
        return nextResponse;
      }
      let userResponse;
      try {
        userResponse = await handler(void 0, session);
      } catch (err) {
        await customErrorHandler()(err, baseRequest, baseResponse, (errorHandlerError) => {
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
          serialize(respCookie.key, respCookie.value, {
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
    let baseRequest = new PreParsedRequest({
      method: req.method,
      url: req.url,
      query,
      headers: req.headers,
      cookies,
      getFormBody: () => req.formData(),
      getJSONBody: () => req.json()
    });
    let baseResponse = new CollectingResponse();
    let userResponse;
    try {
      userResponse = await handler(baseRequest, baseResponse);
    } catch (err) {
      await customErrorHandler()(err, baseRequest, baseResponse, (errorHandlerError) => {
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
        serialize(respCookie.key, respCookie.value, {
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
export {
  NextJS as default,
  getAppDirRequestHandler,
  getSSRSession,
  superTokensNextWrapper,
  withPreParsedRequestResponse,
  withSession
};
