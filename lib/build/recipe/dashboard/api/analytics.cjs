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
var analytics_exports = {};
__export(analytics_exports, {
  default: () => analyticsPost
});
module.exports = __toCommonJS(analytics_exports);
var import_supertokens = __toESM(require("../../../supertokens"), 1);
var import_querier = require("../../../querier");
var import_normalisedURLPath = __toESM(require("../../../normalisedURLPath"), 1);
var import_version = require("../../../version");
var import_error = __toESM(require("../../../error"), 1);
var import_utils = require("../../../utils");
async function analyticsPost(_, ___, options, userContext) {
  if (!import_supertokens.default.getInstanceOrThrowError().telemetryEnabled) {
    return {
      status: "OK"
    };
  }
  const { email, dashboardVersion } = await options.req.getJSONBody();
  if (email === void 0) {
    throw new import_error.default({
      message: "Missing required property 'email'",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  if (dashboardVersion === void 0) {
    throw new import_error.default({
      message: "Missing required property 'dashboardVersion'",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  let telemetryId;
  let numberOfUsers;
  try {
    let querier = import_querier.Querier.getNewInstanceOrThrowError(options.recipeId);
    let response = await querier.sendGetRequest(new import_normalisedURLPath.default("/telemetry"), {}, userContext);
    if (response.exists) {
      telemetryId = response.telemetryId;
    }
    numberOfUsers = await import_supertokens.default.getInstanceOrThrowError().getUserCount(void 0, void 0, userContext);
  } catch (_2) {
    return {
      status: "OK"
    };
  }
  const { apiDomain, getOrigin: websiteDomain, appName } = options.appInfo;
  const data = {
    websiteDomain: websiteDomain({
      request: void 0,
      userContext
    }).getAsStringDangerous(),
    apiDomain: apiDomain.getAsStringDangerous(),
    appName,
    sdk: "node",
    sdkVersion: import_version.version,
    telemetryId,
    numberOfUsers,
    email,
    dashboardVersion
  };
  try {
    await (0, import_utils.doFetch)("https://api.supertokens.com/0/st/telemetry", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "api-version": "3",
        "content-type": "application/json; charset=utf-8"
      }
    });
  } catch (e) {
  }
  return {
    status: "OK"
  };
}
