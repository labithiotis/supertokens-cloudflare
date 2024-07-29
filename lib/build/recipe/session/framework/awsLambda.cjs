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
var awsLambda_exports = {};
__export(awsLambda_exports, {
  verifySession: () => verifySession
});
module.exports = __toCommonJS(awsLambda_exports);
var import_framework = require("../../../framework/awsLambda/framework");
var import_supertokens = __toESM(require("../../../supertokens"), 1);
var import_recipe = __toESM(require("../recipe"), 1);
var import_utils = require("../../../utils");
function verifySession(handler, verifySessionOptions) {
  return async (event, context, callback) => {
    let supertokens = import_supertokens.default.getInstanceOrThrowError();
    let request = new import_framework.AWSRequest(event);
    let response = new import_framework.AWSResponse(event);
    const userContext = (0, import_utils.makeDefaultUserContextFromAPI)(request);
    try {
      let sessionRecipe = import_recipe.default.getInstanceOrThrowError();
      event.session = await sessionRecipe.verifySession(verifySessionOptions, request, response, userContext);
      let handlerResult = await handler(event, context, callback);
      return response.sendResponse(handlerResult);
    } catch (err) {
      await supertokens.errorHandler(err, request, response, userContext);
      if (response.responseSet) {
        return response.sendResponse({});
      }
      throw err;
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  verifySession
});
