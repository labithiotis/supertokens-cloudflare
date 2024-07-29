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
  default: () => getRecipeInterface
});
module.exports = __toCommonJS(recipeImplementation_exports);
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
function getRecipeInterface(querier) {
  return {
    getUserMetadata: function({ userId, userContext }) {
      return querier.sendGetRequest(new import_normalisedURLPath.default("/recipe/user/metadata"), { userId }, userContext);
    },
    updateUserMetadata: function({ userId, metadataUpdate, userContext }) {
      return querier.sendPutRequest(
        new import_normalisedURLPath.default("/recipe/user/metadata"),
        {
          userId,
          metadataUpdate
        },
        userContext
      );
    },
    clearUserMetadata: function({ userId, userContext }) {
      return querier.sendPostRequest(
        new import_normalisedURLPath.default("/recipe/user/metadata/remove"),
        {
          userId
        },
        userContext
      );
    }
  };
}
