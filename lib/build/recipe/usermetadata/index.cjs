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
var usermetadata_exports = {};
__export(usermetadata_exports, {
  clearUserMetadata: () => clearUserMetadata,
  default: () => Wrapper,
  getUserMetadata: () => getUserMetadata,
  init: () => init,
  updateUserMetadata: () => updateUserMetadata
});
module.exports = __toCommonJS(usermetadata_exports);
var import_utils = require("../../utils");
var import_recipe = __toESM(require("./recipe"), 1);
class Wrapper {
  static async getUserMetadata(userId, userContext) {
    return await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.getUserMetadata({
      userId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async updateUserMetadata(userId, metadataUpdate, userContext) {
    return await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.updateUserMetadata({
      userId,
      metadataUpdate,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async clearUserMetadata(userId, userContext) {
    return await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.clearUserMetadata({
      userId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
}
Wrapper.init = import_recipe.default.init;
const init = Wrapper.init;
const getUserMetadata = Wrapper.getUserMetadata;
const updateUserMetadata = Wrapper.updateUserMetadata;
const clearUserMetadata = Wrapper.clearUserMetadata;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  clearUserMetadata,
  getUserMetadata,
  init,
  updateUserMetadata
});
