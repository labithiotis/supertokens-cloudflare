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
var userEmailVerifyGet_exports = {};
__export(userEmailVerifyGet_exports, {
  userEmailVerifyGet: () => userEmailVerifyGet
});
module.exports = __toCommonJS(userEmailVerifyGet_exports);
var import_error = __toESM(require("../../../../error"), 1);
var import_emailverification = __toESM(require("../../../emailverification"), 1);
var import_recipe = __toESM(require("../../../emailverification/recipe"), 1);
var import_recipeUserId = __toESM(require("../../../../recipeUserId"), 1);
const userEmailVerifyGet = async (_, ___, options, userContext) => {
  const req = options.req;
  const recipeUserId = req.getKeyValueFromQuery("recipeUserId");
  if (recipeUserId === void 0) {
    throw new import_error.default({
      message: "Missing required parameter 'recipeUserId'",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  try {
    import_recipe.default.getInstanceOrThrowError();
  } catch (e) {
    return {
      status: "FEATURE_NOT_ENABLED_ERROR"
    };
  }
  const response = await import_emailverification.default.isEmailVerified(new import_recipeUserId.default(recipeUserId), void 0, userContext);
  return {
    status: "OK",
    isVerified: response
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  userEmailVerifyGet
});
