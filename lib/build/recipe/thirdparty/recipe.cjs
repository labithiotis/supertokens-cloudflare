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
var import_recipeModule = __toESM(require("../../recipeModule"), 1);
var import_utils = require("./utils");
var import_recipe = __toESM(require("../multitenancy/recipe"), 1);
var import_error = __toESM(require("./error"), 1);
var import_constants = require("./constants");
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import_signinup = __toESM(require("./api/signinup"), 1);
var import_authorisationUrl = __toESM(require("./api/authorisationUrl"), 1);
var import_recipeImplementation = __toESM(require("./recipeImplementation"), 1);
var import_implementation = __toESM(require("./api/implementation"), 1);
var import_querier = require("../../querier");
var import_appleRedirect = __toESM(require("./api/appleRedirect"), 1);
var import_supertokens_js_override = __toESM(require("supertokens-js-override"), 1);
var import_postSuperTokensInitCallbacks = require("../../postSuperTokensInitCallbacks");
var import_multifactorauth = require("../multifactorauth");
var import_node_process = require("node:process");
const _Recipe = class _Recipe extends import_recipeModule.default {
  constructor(recipeId, appInfo, isInServerlessEnv, config, _recipes, _ingredients) {
    super(recipeId, appInfo);
    this.getAPIsHandled = () => {
      return [
        {
          method: "post",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.SIGN_IN_UP_API),
          id: import_constants.SIGN_IN_UP_API,
          disabled: this.apiImpl.signInUpPOST === void 0
        },
        {
          method: "get",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.AUTHORISATION_API),
          id: import_constants.AUTHORISATION_API,
          disabled: this.apiImpl.authorisationUrlGET === void 0
        },
        {
          method: "post",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.APPLE_REDIRECT_HANDLER),
          id: import_constants.APPLE_REDIRECT_HANDLER,
          disabled: this.apiImpl.appleRedirectHandlerPOST === void 0
        }
      ];
    };
    this.handleAPIRequest = async (id, tenantId, req, res, _path, _method, userContext) => {
      let options = {
        config: this.config,
        recipeId: this.getRecipeId(),
        isInServerlessEnv: this.isInServerlessEnv,
        recipeImplementation: this.recipeInterfaceImpl,
        providers: this.providers,
        req,
        res,
        appInfo: this.getAppInfo()
      };
      if (id === import_constants.SIGN_IN_UP_API) {
        return await (0, import_signinup.default)(this.apiImpl, tenantId, options, userContext);
      } else if (id === import_constants.AUTHORISATION_API) {
        return await (0, import_authorisationUrl.default)(this.apiImpl, tenantId, options, userContext);
      } else if (id === import_constants.APPLE_REDIRECT_HANDLER) {
        return await (0, import_appleRedirect.default)(this.apiImpl, options, userContext);
      }
      return false;
    };
    this.handleError = async (err, _request, _response) => {
      throw err;
    };
    this.getAllCORSHeaders = () => {
      return [];
    };
    this.isErrorFromThisRecipe = (err) => {
      return import_error.default.isErrorFromSuperTokens(err) && err.fromRecipe === _Recipe.RECIPE_ID;
    };
    this.config = (0, import_utils.validateAndNormaliseUserInput)(appInfo, config);
    this.isInServerlessEnv = isInServerlessEnv;
    this.providers = this.config.signInAndUpFeature.providers;
    {
      let builder = new import_supertokens_js_override.default(
        (0, import_recipeImplementation.default)(import_querier.Querier.getNewInstanceOrThrowError(recipeId), this.providers)
      );
      this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
    }
    {
      let builder = new import_supertokens_js_override.default((0, import_implementation.default)());
      this.apiImpl = builder.override(this.config.override.apis).build();
    }
    import_postSuperTokensInitCallbacks.PostSuperTokensInitCallbacks.addPostInitCallback(() => {
      const mtRecipe = import_recipe.default.getInstance();
      if (mtRecipe !== void 0) {
        mtRecipe.staticThirdPartyProviders = this.config.signInAndUpFeature.providers;
        mtRecipe.allAvailableFirstFactors.push(import_multifactorauth.FactorIds.THIRDPARTY);
      }
    });
  }
  static init(config) {
    return (appInfo, isInServerlessEnv) => {
      if (_Recipe.instance === void 0) {
        _Recipe.instance = new _Recipe(
          _Recipe.RECIPE_ID,
          appInfo,
          isInServerlessEnv,
          config,
          {},
          {
            emailDelivery: void 0
          }
        );
        return _Recipe.instance;
      } else {
        throw new Error("ThirdParty recipe has already been initialised. Please check your code for bugs.");
      }
    };
  }
  static getInstanceOrThrowError() {
    if (_Recipe.instance !== void 0) {
      return _Recipe.instance;
    }
    throw new Error("Initialisation not done. Did you forget to call the ThirdParty.init function?");
  }
  static reset() {
    if (import_node_process.env.TEST_MODE !== "testing") {
      throw new Error("calling testing function in non testing env");
    }
    _Recipe.instance = void 0;
  }
};
_Recipe.instance = void 0;
_Recipe.RECIPE_ID = "thirdparty";
let Recipe = _Recipe;
