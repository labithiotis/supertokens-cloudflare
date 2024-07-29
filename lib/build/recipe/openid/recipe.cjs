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
  default: () => OpenIdRecipe
});
module.exports = __toCommonJS(recipe_exports);
var import_error = __toESM(require("../../error"), 1);
var import_recipeModule = __toESM(require("../../recipeModule"), 1);
var import_utils = require("./utils");
var import_recipe = __toESM(require("../jwt/recipe"), 1);
var import_supertokens_js_override = __toESM(require("supertokens-js-override"), 1);
var import_recipeImplementation = __toESM(require("./recipeImplementation"), 1);
var import_implementation = __toESM(require("./api/implementation"), 1);
var import_normalisedURLPath2 = __toESM(require("../../normalisedURLPath"), 1);
var import_constants = require("./constants");
var import_getOpenIdDiscoveryConfiguration = __toESM(require("./api/getOpenIdDiscoveryConfiguration"), 1);
var import_node_process = require("node:process");
const _OpenIdRecipe = class _OpenIdRecipe extends import_recipeModule.default {
  constructor(recipeId, appInfo, isInServerlessEnv, config) {
    super(recipeId, appInfo);
    this.getAPIsHandled = () => {
      return [
        {
          method: "get",
          pathWithoutApiBasePath: new import_normalisedURLPath2.default(import_constants.GET_DISCOVERY_CONFIG_URL),
          id: import_constants.GET_DISCOVERY_CONFIG_URL,
          disabled: this.apiImpl.getOpenIdDiscoveryConfigurationGET === void 0
        },
        ...this.jwtRecipe.getAPIsHandled()
      ];
    };
    this.handleAPIRequest = async (id, tenantId, req, response, path, method, userContext) => {
      let apiOptions = {
        recipeImplementation: this.recipeImplementation,
        config: this.config,
        recipeId: this.getRecipeId(),
        req,
        res: response
      };
      if (id === import_constants.GET_DISCOVERY_CONFIG_URL) {
        return await (0, import_getOpenIdDiscoveryConfiguration.default)(this.apiImpl, apiOptions, userContext);
      } else {
        return this.jwtRecipe.handleAPIRequest(id, tenantId, req, response, path, method, userContext);
      }
    };
    this.handleError = async (error, request, response, userContext) => {
      if (error.fromRecipe === _OpenIdRecipe.RECIPE_ID) {
        throw error;
      } else {
        return await this.jwtRecipe.handleError(error, request, response, userContext);
      }
    };
    this.getAllCORSHeaders = () => {
      return [...this.jwtRecipe.getAllCORSHeaders()];
    };
    this.isErrorFromThisRecipe = (err) => {
      return import_error.default.isErrorFromSuperTokens(err) && err.fromRecipe === _OpenIdRecipe.RECIPE_ID || this.jwtRecipe.isErrorFromThisRecipe(err);
    };
    this.config = (0, import_utils.validateAndNormaliseUserInput)(appInfo, config);
    this.jwtRecipe = new import_recipe.default(recipeId, appInfo, isInServerlessEnv, {
      jwtValiditySeconds: this.config.jwtValiditySeconds,
      override: this.config.override.jwtFeature
    });
    let builder = new import_supertokens_js_override.default((0, import_recipeImplementation.default)(this.config, this.jwtRecipe.recipeInterfaceImpl));
    this.recipeImplementation = builder.override(this.config.override.functions).build();
    let apiBuilder = new import_supertokens_js_override.default((0, import_implementation.default)());
    this.apiImpl = apiBuilder.override(this.config.override.apis).build();
  }
  static getInstanceOrThrowError() {
    if (_OpenIdRecipe.instance !== void 0) {
      return _OpenIdRecipe.instance;
    }
    throw new Error("Initialisation not done. Did you forget to call the Openid.init function?");
  }
  static init(config) {
    return (appInfo, isInServerlessEnv) => {
      if (_OpenIdRecipe.instance === void 0) {
        _OpenIdRecipe.instance = new _OpenIdRecipe(_OpenIdRecipe.RECIPE_ID, appInfo, isInServerlessEnv, config);
        return _OpenIdRecipe.instance;
      } else {
        throw new Error("OpenId recipe has already been initialised. Please check your code for bugs.");
      }
    };
  }
  static reset() {
    if (import_node_process.env.TEST_MODE !== "testing") {
      throw new Error("calling testing function in non testing env");
    }
    _OpenIdRecipe.instance = void 0;
  }
};
_OpenIdRecipe.RECIPE_ID = "openid";
_OpenIdRecipe.instance = void 0;
let OpenIdRecipe = _OpenIdRecipe;
