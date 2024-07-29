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
var hapi_exports = {};
__export(hapi_exports, {
  verifySession: () => verifySession
});
module.exports = __toCommonJS(hapi_exports);
var import_supertokens = __toESM(require("../../../supertokens"), 1);
var import_recipe = __toESM(require("../recipe"), 1);
var import_framework = require("../../../framework/hapi/framework");
var import_utils = require("../../../utils");
function verifySession(options) {
  return async (req, h) => {
    let sessionRecipe = import_recipe.default.getInstanceOrThrowError();
    let request = new import_framework.HapiRequest(req);
    let response = new import_framework.HapiResponse(h);
    const userContext = (0, import_utils.makeDefaultUserContextFromAPI)(request);
    try {
      req.session = await sessionRecipe.verifySession(options, request, response, userContext);
    } catch (err) {
      try {
        const supertokens = import_supertokens.default.getInstanceOrThrowError();
        await supertokens.errorHandler(err, request, response, userContext);
        if (response.responseSet) {
          let resObj = response.sendResponse(true);
          (req.app.lazyHeaders || []).forEach(({ key, value, allowDuplicateKey }) => {
            resObj.header(key, value, { append: allowDuplicateKey });
          });
          return resObj.takeover();
        }
      } catch (e) {
        throw err;
      }
    }
    return h.continue;
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  verifySession
});
