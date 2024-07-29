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
var recipeModule_exports = {};
__export(recipeModule_exports, {
  default: () => RecipeModule
});
module.exports = __toCommonJS(recipeModule_exports);
var import_normalisedURLPath = __toESM(require("./normalisedURLPath"), 1);
var import_constants = require("./recipe/multitenancy/constants");
var import_recipe = __toESM(require("./recipe/multitenancy/recipe"), 1);
class RecipeModule {
  constructor(recipeId, appInfo) {
    this.getRecipeId = () => {
      return this.recipeId;
    };
    this.getAppInfo = () => {
      return this.appInfo;
    };
    this.returnAPIIdIfCanHandleRequest = async (path, method, userContext) => {
      let apisHandled = this.getAPIsHandled();
      const basePathStr = this.appInfo.apiBasePath.getAsStringDangerous();
      const pathStr = path.getAsStringDangerous();
      const regex = new RegExp(`^${basePathStr}(?:/([a-zA-Z0-9-]+))?(/.*)$`);
      const match = pathStr.match(regex);
      let tenantId = import_constants.DEFAULT_TENANT_ID;
      let remainingPath = void 0;
      if (match) {
        tenantId = match[1];
        remainingPath = new import_normalisedURLPath.default(match[2]);
      }
      const mtRecipe = import_recipe.default.getInstanceOrThrowError();
      for (let i = 0; i < apisHandled.length; i++) {
        let currAPI = apisHandled[i];
        if (!currAPI.disabled && currAPI.method === method) {
          if (this.appInfo.apiBasePath.appendPath(currAPI.pathWithoutApiBasePath).equals(path)) {
            const finalTenantId = await mtRecipe.recipeInterfaceImpl.getTenantId({
              tenantIdFromFrontend: import_constants.DEFAULT_TENANT_ID,
              userContext
            });
            return { id: currAPI.id, tenantId: finalTenantId };
          } else if (remainingPath !== void 0 && this.appInfo.apiBasePath.appendPath(currAPI.pathWithoutApiBasePath).equals(this.appInfo.apiBasePath.appendPath(remainingPath))) {
            const finalTenantId = await mtRecipe.recipeInterfaceImpl.getTenantId({
              tenantIdFromFrontend: tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId,
              userContext
            });
            return { id: currAPI.id, tenantId: finalTenantId };
          }
        }
      }
      return void 0;
    };
    this.recipeId = recipeId;
    this.appInfo = appInfo;
  }
}
