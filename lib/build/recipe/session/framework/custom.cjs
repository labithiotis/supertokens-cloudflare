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
var custom_exports = {};
__export(custom_exports, {
  verifySession: () => verifySession
});
module.exports = __toCommonJS(custom_exports);
var import_recipe = __toESM(require("../recipe"), 1);
var import_supertokens = __toESM(require("../../../supertokens"), 1);
var import_utils = require("../../../utils");
function verifySession(options) {
  return async (req, res, next) => {
    const userContext = (0, import_utils.makeDefaultUserContextFromAPI)(req);
    try {
      const sessionRecipe = import_recipe.default.getInstanceOrThrowError();
      req.session = await sessionRecipe.verifySession(options, req, res, userContext);
      if (next !== void 0) {
        next();
      }
      return void 0;
    } catch (err) {
      try {
        const supertokens = import_supertokens.default.getInstanceOrThrowError();
        await supertokens.errorHandler(err, req, res, userContext);
        return void 0;
      } catch (e) {
        if (next !== void 0) {
          next(err);
        }
        return err;
      }
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  verifySession
});
