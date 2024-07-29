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
var recipe_exports = {};
__export(recipe_exports, {
  default: () => Recipe
});
module.exports = __toCommonJS(recipe_exports);
var import_error = __toESM(require("../../error"), 1);
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import_querier = require("../../querier");
var import_recipeModule = __toESM(require("../../recipeModule"), 1);
var import_getJWKS = __toESM(require("./api/getJWKS"), 1);
var import_implementation = __toESM(require("./api/implementation"), 1);
var import_constants = require("./constants");
var import_recipeImplementation = __toESM(require("./recipeImplementation"), 1);
var import_utils = require("./utils");
var import_supertokens_js_override = __toESM(require("supertokens-js-override"), 1);
var import_node_process = require("node:process");
const _Recipe = class _Recipe extends import_recipeModule.default {
  constructor(recipeId, appInfo, isInServerlessEnv, config) {
    super(recipeId, appInfo);
    this.handleAPIRequest = async (_id, _tenantId, req, res, _path, _method, userContext) => {
      let options = {
        config: this.config,
        recipeId: this.getRecipeId(),
        isInServerlessEnv: this.isInServerlessEnv,
        recipeImplementation: this.recipeInterfaceImpl,
        req,
        res
      };
      return await (0, import_getJWKS.default)(this.apiImpl, options, userContext);
    };
    this.config = (0, import_utils.validateAndNormaliseUserInput)(this, appInfo, config);
    this.isInServerlessEnv = isInServerlessEnv;
    {
      let builder = new import_supertokens_js_override.default(
        (0, import_recipeImplementation.default)(import_querier.Querier.getNewInstanceOrThrowError(recipeId), this.config, appInfo)
      );
      this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
    }
    {
      let builder = new import_supertokens_js_override.default((0, import_implementation.default)());
      this.apiImpl = builder.override(this.config.override.apis).build();
    }
  }
  /* Init functions */
  static getInstanceOrThrowError() {
    if (_Recipe.instance !== void 0) {
      return _Recipe.instance;
    }
    throw new Error("Initialisation not done. Did you forget to call the Jwt.init function?");
  }
  static init(config) {
    return (appInfo, isInServerlessEnv) => {
      if (_Recipe.instance === void 0) {
        _Recipe.instance = new _Recipe(_Recipe.RECIPE_ID, appInfo, isInServerlessEnv, config);
        return _Recipe.instance;
      } else {
        throw new Error("JWT recipe has already been initialised. Please check your code for bugs.");
      }
    };
  }
  static reset() {
    if (import_node_process.env.TEST_MODE !== "testing") {
      throw new Error("calling testing function in non testing env");
    }
    _Recipe.instance = void 0;
  }
  /* RecipeModule functions */
  getAPIsHandled() {
    return [
      {
        method: "get",
        pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.GET_JWKS_API),
        id: import_constants.GET_JWKS_API,
        disabled: this.apiImpl.getJWKSGET === void 0
      }
    ];
  }
  handleError(error2, _, __, _userContext) {
    throw error2;
  }
  getAllCORSHeaders() {
    return [];
  }
  isErrorFromThisRecipe(err) {
    return import_error.default.isErrorFromSuperTokens(err) && err.fromRecipe === _Recipe.RECIPE_ID;
  }
};
_Recipe.RECIPE_ID = "jwt";
_Recipe.instance = void 0;
let Recipe = _Recipe;
