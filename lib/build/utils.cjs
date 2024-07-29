"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var utils_exports = {};
__export(utils_exports, {
  doFetch: () => doFetch,
  frontendHasInterceptor: () => frontendHasInterceptor,
  getBackwardsCompatibleUserInfo: () => getBackwardsCompatibleUserInfo,
  getFromObjectCaseInsensitive: () => getFromObjectCaseInsensitive,
  getLargestVersionFromIntersection: () => getLargestVersionFromIntersection,
  getLatestFDIVersionFromFDIList: () => getLatestFDIVersionFromFDIList,
  getRidFromHeader: () => getRidFromHeader,
  getTopLevelDomainForSameSiteResolution: () => getTopLevelDomainForSameSiteResolution,
  getUserContext: () => getUserContext,
  hasGreaterThanEqualToFDI: () => hasGreaterThanEqualToFDI,
  humaniseMilliseconds: () => humaniseMilliseconds,
  isAnIpAddress: () => isAnIpAddress,
  makeDefaultUserContextFromAPI: () => makeDefaultUserContextFromAPI,
  maxVersion: () => maxVersion,
  normaliseEmail: () => normaliseEmail,
  normaliseHttpMethod: () => normaliseHttpMethod,
  normaliseInputAppInfoOrThrowError: () => normaliseInputAppInfoOrThrowError,
  postWithFetch: () => postWithFetch,
  send200Response: () => send200Response,
  sendNon200Response: () => sendNon200Response,
  sendNon200ResponseWithMessage: () => sendNon200ResponseWithMessage,
  setRequestInUserContextIfNotDefined: () => setRequestInUserContextIfNotDefined
});
module.exports = __toCommonJS(utils_exports);
var import_tldts = require("tldts");
var import_normalisedURLDomain = __toESM(require("./normalisedURLDomain"), 1);
var import_normalisedURLPath = __toESM(require("./normalisedURLPath"), 1);
var import_logger = require("./logger");
var import_constants = require("./constants");
var import_cross_fetch = __toESM(require("cross-fetch"), 1);
var import_processState = require("./processState");
const doFetch = async (input, init) => {
  if (init === void 0) {
    import_processState.ProcessState.getInstance().addState(import_processState.PROCESS_STATE.ADDING_NO_CACHE_HEADER_IN_FETCH);
    init = {
      cache: "no-cache"
    };
  } else {
    if (init.cache === void 0) {
      import_processState.ProcessState.getInstance().addState(import_processState.PROCESS_STATE.ADDING_NO_CACHE_HEADER_IN_FETCH);
      init.cache = "no-cache";
    }
  }
  const fetchFunction = typeof fetch !== "undefined" ? fetch : import_cross_fetch.default;
  try {
    return await fetchFunction(input, init);
  } catch (e) {
    const unimplementedCacheError = e && typeof e === "object" && "message" in e && e.message === "The 'cache' field on 'RequestInitializerDict' is not implemented.";
    if (!unimplementedCacheError) throw e;
    const newOpts = __spreadValues({}, init);
    delete newOpts.cache;
    return await fetchFunction(input, newOpts);
  }
};
function getLargestVersionFromIntersection(v1, v2) {
  let intersection = v1.filter((value) => v2.indexOf(value) !== -1);
  if (intersection.length === 0) {
    return void 0;
  }
  let maxVersionSoFar = intersection[0];
  for (let i = 1; i < intersection.length; i++) {
    maxVersionSoFar = maxVersion(intersection[i], maxVersionSoFar);
  }
  return maxVersionSoFar;
}
function maxVersion(version1, version2) {
  let splittedv1 = version1.split(".");
  let splittedv2 = version2.split(".");
  let minLength = Math.min(splittedv1.length, splittedv2.length);
  for (let i = 0; i < minLength; i++) {
    let v1 = Number(splittedv1[i]);
    let v2 = Number(splittedv2[i]);
    if (v1 > v2) {
      return version1;
    } else if (v2 > v1) {
      return version2;
    }
  }
  if (splittedv1.length >= splittedv2.length) {
    return version1;
  }
  return version2;
}
function normaliseInputAppInfoOrThrowError(appInfo) {
  if (appInfo === void 0) {
    throw new Error("Please provide the appInfo object when calling supertokens.init");
  }
  if (appInfo.apiDomain === void 0) {
    throw new Error("Please provide your apiDomain inside the appInfo object when calling supertokens.init");
  }
  if (appInfo.appName === void 0) {
    throw new Error("Please provide your appName inside the appInfo object when calling supertokens.init");
  }
  let apiGatewayPath = appInfo.apiGatewayPath !== void 0 ? new import_normalisedURLPath.default(appInfo.apiGatewayPath) : new import_normalisedURLPath.default("");
  if (appInfo.origin === void 0 && appInfo.websiteDomain === void 0) {
    throw new Error(
      "Please provide either origin or websiteDomain inside the appInfo object when calling supertokens.init"
    );
  }
  let websiteDomainFunction = (input) => {
    let origin = appInfo.origin;
    if (origin === void 0) {
      origin = appInfo.websiteDomain;
    }
    if (origin === void 0) {
      throw new Error("Should never come here");
    }
    if (typeof origin === "function") {
      origin = origin(input);
    }
    return new import_normalisedURLDomain.default(origin);
  };
  const apiDomain = new import_normalisedURLDomain.default(appInfo.apiDomain);
  const topLevelAPIDomain = getTopLevelDomainForSameSiteResolution(apiDomain.getAsStringDangerous());
  const topLevelWebsiteDomain = (input) => {
    return getTopLevelDomainForSameSiteResolution(websiteDomainFunction(input).getAsStringDangerous());
  };
  return {
    appName: appInfo.appName,
    getOrigin: websiteDomainFunction,
    apiDomain,
    apiBasePath: apiGatewayPath.appendPath(
      appInfo.apiBasePath === void 0 ? new import_normalisedURLPath.default("/auth") : new import_normalisedURLPath.default(appInfo.apiBasePath)
    ),
    websiteBasePath: appInfo.websiteBasePath === void 0 ? new import_normalisedURLPath.default("/auth") : new import_normalisedURLPath.default(appInfo.websiteBasePath),
    apiGatewayPath,
    topLevelAPIDomain,
    getTopLevelWebsiteDomain: topLevelWebsiteDomain
  };
}
function normaliseHttpMethod(method) {
  return method.toLowerCase();
}
function sendNon200ResponseWithMessage(res, message, statusCode) {
  sendNon200Response(res, statusCode, { message });
}
function sendNon200Response(res, statusCode, body) {
  if (statusCode < 300) {
    throw new Error("Calling sendNon200Response with status code < 300");
  }
  (0, import_logger.logDebugMessage)("Sending response to client with status code: " + statusCode);
  res.setStatusCode(statusCode);
  res.sendJSONResponse(body);
}
function send200Response(res, responseJson) {
  (0, import_logger.logDebugMessage)("Sending response to client with status code: 200");
  responseJson = deepTransform(responseJson);
  res.setStatusCode(200);
  res.sendJSONResponse(responseJson);
}
function deepTransform(obj) {
  let out = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    let val = obj[key];
    if (val && typeof val === "object" && val["toJson"] !== void 0 && typeof val["toJson"] === "function") {
      out[key] = val.toJson();
    } else if (val && typeof val === "object") {
      out[key] = deepTransform(val);
    } else {
      out[key] = val;
    }
  }
  return out;
}
function isAnIpAddress(ipaddress) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    ipaddress
  );
}
function getBackwardsCompatibleUserInfo(req, result, userContext) {
  let resp;
  if (hasGreaterThanEqualToFDI(req, "1.18") && !hasGreaterThanEqualToFDI(req, "2.0") || hasGreaterThanEqualToFDI(req, "3.0")) {
    resp = {
      user: result.user.toJson()
    };
    if (result.createdNewRecipeUser !== void 0) {
      resp.createdNewRecipeUser = result.createdNewRecipeUser;
    }
    return resp;
  } else {
    let loginMethod = result.user.loginMethods.find(
      (lm) => lm.recipeUserId.getAsString() === result.session.getRecipeUserId(userContext).getAsString()
    );
    if (loginMethod === void 0) {
      for (let i = 0; i < result.user.loginMethods.length; i++) {
        if (loginMethod === void 0) {
          loginMethod = result.user.loginMethods[i];
        } else if (loginMethod.timeJoined > result.user.loginMethods[i].timeJoined) {
          loginMethod = result.user.loginMethods[i];
        }
      }
    }
    if (loginMethod === void 0) {
      throw new Error("This should never happen - user has no login methods");
    }
    const userObj = {
      id: result.user.id,
      // we purposely use this instead of the loginmethod's recipeUserId because if the oldest login method is deleted, then this userID should remain the same.
      timeJoined: loginMethod.timeJoined
    };
    if (loginMethod.thirdParty) {
      userObj.thirdParty = loginMethod.thirdParty;
    }
    if (loginMethod.email) {
      userObj.email = loginMethod.email;
    }
    if (loginMethod.phoneNumber) {
      userObj.phoneNumber = loginMethod.phoneNumber;
    }
    resp = {
      user: userObj
    };
    if (result.createdNewRecipeUser !== void 0) {
      resp.createdNewUser = result.createdNewRecipeUser;
    }
  }
  return resp;
}
function getLatestFDIVersionFromFDIList(fdiHeaderValue) {
  let versions = fdiHeaderValue.split(",");
  let maxVersionStr = versions[0];
  for (let i = 1; i < versions.length; i++) {
    maxVersionStr = maxVersion(maxVersionStr, versions[i]);
  }
  return maxVersionStr;
}
function hasGreaterThanEqualToFDI(req, version) {
  let requestFDI = req.getHeaderValue(import_constants.HEADER_FDI);
  if (requestFDI === void 0) {
    return true;
  }
  requestFDI = getLatestFDIVersionFromFDIList(requestFDI);
  if (requestFDI === version || maxVersion(version, requestFDI) !== version) {
    return true;
  }
  return false;
}
function getRidFromHeader(req) {
  return req.getHeaderValue(import_constants.HEADER_RID);
}
function frontendHasInterceptor(req) {
  return getRidFromHeader(req) !== void 0;
}
function humaniseMilliseconds(ms) {
  let t = Math.floor(ms / 1e3);
  let suffix = "";
  if (t < 60) {
    if (t > 1) suffix = "s";
    return `${t} second${suffix}`;
  } else if (t < 3600) {
    const m = Math.floor(t / 60);
    if (m > 1) suffix = "s";
    return `${m} minute${suffix}`;
  } else {
    const h = Math.floor(t / 360) / 10;
    if (h > 1) suffix = "s";
    return `${h} hour${suffix}`;
  }
}
function makeDefaultUserContextFromAPI(request) {
  return setRequestInUserContextIfNotDefined({}, request);
}
function getUserContext(inputUserContext) {
  return inputUserContext != null ? inputUserContext : {};
}
function setRequestInUserContextIfNotDefined(userContext, request) {
  if (userContext === void 0) {
    userContext = {};
  }
  if (userContext._default === void 0) {
    userContext._default = {};
  }
  if (typeof userContext._default === "object") {
    userContext._default.request = request;
    userContext._default.keepCacheAlive = true;
  }
  return userContext;
}
function getTopLevelDomainForSameSiteResolution(url) {
  let urlObj = new URL(url);
  let hostname = urlObj.hostname;
  if (hostname.startsWith("localhost") || hostname.startsWith("localhost.org") || isAnIpAddress(hostname)) {
    return "localhost";
  }
  let parsedURL = (0, import_tldts.parse)(hostname);
  if (parsedURL.domain === null) {
    if (hostname.endsWith(".amazonaws.com") && parsedURL.publicSuffix === hostname) {
      return hostname;
    }
    if (hostname.endsWith(".local") && parsedURL.publicSuffix === null) {
      return hostname;
    }
    throw new Error("Please make sure that the apiDomain and websiteDomain have correct values");
  }
  return parsedURL.domain;
}
function getFromObjectCaseInsensitive(key, object) {
  const matchedKeys = Object.keys(object).filter((i) => i.toLocaleLowerCase() === key.toLocaleLowerCase());
  if (matchedKeys.length === 0) {
    return void 0;
  }
  return object[matchedKeys[0]];
}
async function postWithFetch(url, headers, body, { successLog, errorLogHeader }) {
  let error;
  let resp;
  try {
    const fetchResp = await doFetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers
    });
    const respText = await fetchResp.text();
    resp = {
      status: fetchResp.status,
      body: JSON.parse(respText)
    };
    if (fetchResp.status < 300) {
      (0, import_logger.logDebugMessage)(successLog);
      return { resp };
    }
    (0, import_logger.logDebugMessage)(errorLogHeader);
    (0, import_logger.logDebugMessage)(`Error status: ${fetchResp.status}`);
    (0, import_logger.logDebugMessage)(`Error response: ${respText}`);
  } catch (caught) {
    error = caught;
    (0, import_logger.logDebugMessage)(errorLogHeader);
    if (error instanceof Error) {
      (0, import_logger.logDebugMessage)(`Error: ${error.message}`);
    } else {
      (0, import_logger.logDebugMessage)(`Error: ${JSON.stringify(error)}`);
    }
  }
  (0, import_logger.logDebugMessage)("Logging the input below:");
  (0, import_logger.logDebugMessage)(JSON.stringify(body, null, 2));
  if (error !== void 0) {
    return {
      error
    };
  }
  return {
    resp
  };
}
function normaliseEmail(email) {
  email = email.trim();
  email = email.toLowerCase();
  return email;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  doFetch,
  frontendHasInterceptor,
  getBackwardsCompatibleUserInfo,
  getFromObjectCaseInsensitive,
  getLargestVersionFromIntersection,
  getLatestFDIVersionFromFDIList,
  getRidFromHeader,
  getTopLevelDomainForSameSiteResolution,
  getUserContext,
  hasGreaterThanEqualToFDI,
  humaniseMilliseconds,
  isAnIpAddress,
  makeDefaultUserContextFromAPI,
  maxVersion,
  normaliseEmail,
  normaliseHttpMethod,
  normaliseInputAppInfoOrThrowError,
  postWithFetch,
  send200Response,
  sendNon200Response,
  sendNon200ResponseWithMessage,
  setRequestInUserContextIfNotDefined
});
