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
var implementation_exports = {};
__export(implementation_exports, {
  default: () => getAPIInterface
});
module.exports = __toCommonJS(implementation_exports);
var import_utils = require("../../../utils");
var import_normalisedURLPath = __toESM(require("../../../normalisedURLPath"), 1);
var import_sessionRequestFunctions = require("../sessionRequestFunctions");
function getAPIInterface() {
  return {
    refreshPOST: async function({
      options,
      userContext
    }) {
      return (0, import_sessionRequestFunctions.refreshSessionInRequest)({
        req: options.req,
        res: options.res,
        userContext,
        config: options.config,
        recipeInterfaceImpl: options.recipeImplementation
      });
    },
    verifySession: async function({
      verifySessionOptions,
      options,
      userContext
    }) {
      let method = (0, import_utils.normaliseHttpMethod)(options.req.getMethod());
      if (method === "options" || method === "trace") {
        return void 0;
      }
      let incomingPath = new import_normalisedURLPath.default(options.req.getOriginalURL());
      let refreshTokenPath = options.config.refreshTokenPath;
      if (incomingPath.equals(refreshTokenPath) && method === "post") {
        return (0, import_sessionRequestFunctions.refreshSessionInRequest)({
          req: options.req,
          res: options.res,
          userContext,
          config: options.config,
          recipeInterfaceImpl: options.recipeImplementation
        });
      } else {
        return (0, import_sessionRequestFunctions.getSessionFromRequest)({
          req: options.req,
          res: options.res,
          options: verifySessionOptions,
          config: options.config,
          recipeInterfaceImpl: options.recipeImplementation,
          userContext
        });
      }
    },
    signOutPOST: async function({
      session,
      userContext
    }) {
      await session.revokeSession(userContext);
      return {
        status: "OK"
      };
    }
  };
}
