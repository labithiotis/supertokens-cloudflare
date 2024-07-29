"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
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
var import_supertokens_js_override = __toESM(require("supertokens-js-override"), 1);
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import_recipeModule = __toESM(require("../../recipeModule"), 1);
var import_error = __toESM(require("../../error"), 1);
var import_recipeImplementation = __toESM(require("./recipeImplementation"), 1);
var import_implementation = __toESM(require("./api/implementation"), 1);
var import_constants = require("./constants");
var import_multiFactorAuthClaim = require("./multiFactorAuthClaim");
var import_utils = require("./utils");
var import_resyncSessionAndFetchMFAInfo = __toESM(require("./api/resyncSessionAndFetchMFAInfo"), 1);
var import_recipe = __toESM(require("../session/recipe"), 1);
var import_postSuperTokensInitCallbacks = require("../../postSuperTokensInitCallbacks");
var import_recipe2 = __toESM(require("../multitenancy/recipe"), 1);
var import_querier = require("../../querier");
var import_node_process = require("node:process");
const _Recipe = class _Recipe extends import_recipeModule.default {
  constructor(recipeId, appInfo, isInServerlessEnv, config) {
    var _a;
    super(recipeId, appInfo);
    this.getFactorsSetupForUserFromOtherRecipesFuncs = [];
    this.getAllAvailableSecondaryFactorIdsFromOtherRecipesFuncs = [];
    this.getEmailsForFactorFromOtherRecipesFunc = [];
    this.getPhoneNumbersForFactorFromOtherRecipesFunc = [];
    this.isGetMfaRequirementsForAuthOverridden = false;
    // abstract instance functions below...............
    this.getAPIsHandled = () => {
      return [
        {
          method: "put",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.RESYNC_SESSION_AND_FETCH_MFA_INFO),
          id: import_constants.RESYNC_SESSION_AND_FETCH_MFA_INFO,
          disabled: this.apiImpl.resyncSessionAndFetchMFAInfoPUT === void 0
        }
      ];
    };
    this.handleAPIRequest = async (id, _tenantId, req, res, _, __, userContext) => {
      let options = {
        recipeInstance: this,
        recipeImplementation: this.recipeInterfaceImpl,
        config: this.config,
        recipeId: this.getRecipeId(),
        isInServerlessEnv: this.isInServerlessEnv,
        req,
        res
      };
      if (id === import_constants.RESYNC_SESSION_AND_FETCH_MFA_INFO) {
        return await (0, import_resyncSessionAndFetchMFAInfo.default)(this.apiImpl, options, userContext);
      }
      throw new Error("should never come here");
    };
    this.handleError = async (err, _, __) => {
      throw err;
    };
    this.getAllCORSHeaders = () => {
      return [];
    };
    this.isErrorFromThisRecipe = (err) => {
      return import_error.default.isErrorFromSuperTokens(err) && err.fromRecipe === _Recipe.RECIPE_ID;
    };
    this.addFuncToGetAllAvailableSecondaryFactorIdsFromOtherRecipes = (f) => {
      this.getAllAvailableSecondaryFactorIdsFromOtherRecipesFuncs.push(f);
    };
    this.getAllAvailableSecondaryFactorIds = (tenantConfig) => {
      let factorIds = [];
      for (const func of this.getAllAvailableSecondaryFactorIdsFromOtherRecipesFuncs) {
        const factorIdsRes = func(tenantConfig);
        for (const factorId of factorIdsRes) {
          if (!factorIds.includes(factorId)) {
            factorIds.push(factorId);
          }
        }
      }
      return factorIds;
    };
    this.addFuncToGetFactorsSetupForUserFromOtherRecipes = (func) => {
      this.getFactorsSetupForUserFromOtherRecipesFuncs.push(func);
    };
    this.addFuncToGetEmailsForFactorFromOtherRecipes = (func) => {
      this.getEmailsForFactorFromOtherRecipesFunc.push(func);
    };
    this.getEmailsForFactors = (user, sessionRecipeUserId) => {
      let result = {
        status: "OK",
        factorIdToEmailsMap: {}
      };
      for (const func of this.getEmailsForFactorFromOtherRecipesFunc) {
        let funcResult = func(user, sessionRecipeUserId);
        if (funcResult.status === "UNKNOWN_SESSION_RECIPE_USER_ID") {
          return {
            status: "UNKNOWN_SESSION_RECIPE_USER_ID"
          };
        }
        result.factorIdToEmailsMap = __spreadValues(__spreadValues({}, result.factorIdToEmailsMap), funcResult.factorIdToEmailsMap);
      }
      return result;
    };
    this.addFuncToGetPhoneNumbersForFactorsFromOtherRecipes = (func) => {
      this.getPhoneNumbersForFactorFromOtherRecipesFunc.push(func);
    };
    this.getPhoneNumbersForFactors = (user, sessionRecipeUserId) => {
      let result = {
        status: "OK",
        factorIdToPhoneNumberMap: {}
      };
      for (const func of this.getPhoneNumbersForFactorFromOtherRecipesFunc) {
        let funcResult = func(user, sessionRecipeUserId);
        if (funcResult.status === "UNKNOWN_SESSION_RECIPE_USER_ID") {
          return {
            status: "UNKNOWN_SESSION_RECIPE_USER_ID"
          };
        }
        result.factorIdToPhoneNumberMap = __spreadValues(__spreadValues({}, result.factorIdToPhoneNumberMap), funcResult.factorIdToPhoneNumberMap);
      }
      return result;
    };
    this.config = (0, import_utils.validateAndNormaliseUserInput)(config);
    this.isInServerlessEnv = isInServerlessEnv;
    {
      let originalImpl = (0, import_recipeImplementation.default)(this);
      let builder = new import_supertokens_js_override.default(originalImpl);
      this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
      if (((_a = config == null ? void 0 : config.override) == null ? void 0 : _a.functions) !== void 0) {
        this.isGetMfaRequirementsForAuthOverridden = true;
      }
    }
    {
      let builder = new import_supertokens_js_override.default((0, import_implementation.default)());
      this.apiImpl = builder.override(this.config.override.apis).build();
    }
    import_postSuperTokensInitCallbacks.PostSuperTokensInitCallbacks.addPostInitCallback(() => {
      const mtRecipe = import_recipe2.default.getInstance();
      if (mtRecipe !== void 0) {
        mtRecipe.staticFirstFactors = this.config.firstFactors;
      }
      import_recipe.default.getInstanceOrThrowError().addClaimValidatorFromOtherRecipe(
        import_multiFactorAuthClaim.MultiFactorAuthClaim.validators.hasCompletedMFARequirementsForAuth()
      );
    });
    this.querier = import_querier.Querier.getNewInstanceOrThrowError(recipeId);
  }
  static getInstanceOrThrowError() {
    if (_Recipe.instance !== void 0) {
      return _Recipe.instance;
    }
    throw new Error("Initialisation not done. Did you forget to call the MultiFactorAuth.init function?");
  }
  static getInstance() {
    return _Recipe.instance;
  }
  static init(config) {
    return (appInfo, isInServerlessEnv) => {
      if (_Recipe.instance === void 0) {
        _Recipe.instance = new _Recipe(_Recipe.RECIPE_ID, appInfo, isInServerlessEnv, config);
        return _Recipe.instance;
      } else {
        throw new Error(
          "MultiFactorAuth recipe has already been initialised. Please check your code for bugs."
        );
      }
    };
  }
  static reset() {
    if (import_node_process.env.TEST_MODE !== "testing") {
      throw new Error("calling testing function in non testing env");
    }
    _Recipe.instance = void 0;
  }
};
_Recipe.instance = void 0;
_Recipe.RECIPE_ID = "multifactorauth";
let Recipe = _Recipe;
