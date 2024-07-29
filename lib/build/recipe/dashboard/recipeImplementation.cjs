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
var recipeImplementation_exports = {};
__export(recipeImplementation_exports, {
  default: () => getRecipeImplementation
});
module.exports = __toCommonJS(recipeImplementation_exports);
var import_error = __toESM(require("./error"), 1);
var import_logger = require("../../logger");
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import_querier = require("../../querier");
var import_utils = require("../../utils");
var import_version = require("../../version");
var import_constants = require("./constants");
var import_utils2 = require("./utils");
function getRecipeImplementation() {
  return {
    getDashboardBundleLocation: async function() {
      return `https://cdn.jsdelivr.net/gh/supertokens/dashboard@v${import_version.dashboardVersion}/build/`;
    },
    shouldAllowAccess: async function(input) {
      var _a;
      if (!input.config.apiKey) {
        let querier = import_querier.Querier.getNewInstanceOrThrowError(void 0);
        const authHeaderValue = (_a = input.req.getHeaderValue("authorization")) == null ? void 0 : _a.split(" ")[1];
        const sessionVerificationResponse = await querier.sendPostRequest(
          new import_normalisedURLPath.default("/recipe/dashboard/session/verify"),
          {
            sessionId: authHeaderValue
          },
          input.userContext
        );
        if (sessionVerificationResponse.status !== "OK") {
          return false;
        }
        if ((0, import_utils.normaliseHttpMethod)(input.req.getMethod()) !== "get") {
          if (input.req.getOriginalURL().endsWith(import_constants.DASHBOARD_ANALYTICS_API)) {
            return true;
          }
          if (input.req.getOriginalURL().endsWith(import_constants.SIGN_OUT_API)) {
            return true;
          }
          const admins = input.config.admins;
          if (admins === void 0) {
            return true;
          }
          if (admins.length === 0) {
            (0, import_logger.logDebugMessage)("User Dashboard: Throwing OPERATION_NOT_ALLOWED because user is not an admin");
            throw new import_error.default();
          }
          const userEmail = sessionVerificationResponse.email;
          if (userEmail === void 0 || typeof userEmail !== "string") {
            (0, import_logger.logDebugMessage)(
              "User Dashboard: Returning Unauthorised because no email was returned from the core. Should never come here"
            );
            return false;
          }
          if (!admins.includes(userEmail)) {
            (0, import_logger.logDebugMessage)("User Dashboard: Throwing OPERATION_NOT_ALLOWED because user is not an admin");
            throw new import_error.default();
          }
        }
        return true;
      }
      return await (0, import_utils2.validateApiKey)(input);
    }
  };
}
