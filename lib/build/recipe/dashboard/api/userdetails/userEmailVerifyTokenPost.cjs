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
var userEmailVerifyTokenPost_exports = {};
__export(userEmailVerifyTokenPost_exports, {
  userEmailVerifyTokenPost: () => userEmailVerifyTokenPost
});
module.exports = __toCommonJS(userEmailVerifyTokenPost_exports);
var import_error = __toESM(require("../../../../error"), 1);
var import_emailverification = __toESM(require("../../../emailverification"), 1);
var import__ = require("../../../..");
const userEmailVerifyTokenPost = async (_, tenantId, options, userContext) => {
  const requestBody = await options.req.getJSONBody();
  const recipeUserId = requestBody.recipeUserId;
  if (recipeUserId === void 0 || typeof recipeUserId !== "string") {
    throw new import_error.default({
      message: "Required parameter 'recipeUserId' is missing or has an invalid type",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  const user = await (0, import__.getUser)(recipeUserId, userContext);
  if (!user) {
    throw new import_error.default({
      message: "Unknown 'recipeUserId'",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  return await import_emailverification.default.sendEmailVerificationEmail(
    tenantId,
    user.id,
    (0, import__.convertToRecipeUserId)(recipeUserId),
    void 0,
    userContext
  );
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  userEmailVerifyTokenPost
});
