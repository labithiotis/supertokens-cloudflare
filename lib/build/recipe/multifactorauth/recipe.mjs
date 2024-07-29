var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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
import OverrideableBuilder from "supertokens-js-override";
import NormalisedURLPath from "../../normalisedURLPath";
import RecipeModule from "../../recipeModule";
import STError from "../../error";
import RecipeImplementation from "./recipeImplementation";
import APIImplementation from "./api/implementation";
import { RESYNC_SESSION_AND_FETCH_MFA_INFO } from "./constants";
import { MultiFactorAuthClaim } from "./multiFactorAuthClaim";
import { validateAndNormaliseUserInput } from "./utils";
import resyncSessionAndFetchMFAInfoAPI from "./api/resyncSessionAndFetchMFAInfo";
import SessionRecipe from "../session/recipe";
import { PostSuperTokensInitCallbacks } from "../../postSuperTokensInitCallbacks";
import MultitenancyRecipe from "../multitenancy/recipe";
import { Querier } from "../../querier";
import { env } from "node:process";
const _Recipe = class _Recipe extends RecipeModule {
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
          pathWithoutApiBasePath: new NormalisedURLPath(RESYNC_SESSION_AND_FETCH_MFA_INFO),
          id: RESYNC_SESSION_AND_FETCH_MFA_INFO,
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
      if (id === RESYNC_SESSION_AND_FETCH_MFA_INFO) {
        return await resyncSessionAndFetchMFAInfoAPI(this.apiImpl, options, userContext);
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
      return STError.isErrorFromSuperTokens(err) && err.fromRecipe === _Recipe.RECIPE_ID;
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
    this.config = validateAndNormaliseUserInput(config);
    this.isInServerlessEnv = isInServerlessEnv;
    {
      let originalImpl = RecipeImplementation(this);
      let builder = new OverrideableBuilder(originalImpl);
      this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
      if (((_a = config == null ? void 0 : config.override) == null ? void 0 : _a.functions) !== void 0) {
        this.isGetMfaRequirementsForAuthOverridden = true;
      }
    }
    {
      let builder = new OverrideableBuilder(APIImplementation());
      this.apiImpl = builder.override(this.config.override.apis).build();
    }
    PostSuperTokensInitCallbacks.addPostInitCallback(() => {
      const mtRecipe = MultitenancyRecipe.getInstance();
      if (mtRecipe !== void 0) {
        mtRecipe.staticFirstFactors = this.config.firstFactors;
      }
      SessionRecipe.getInstanceOrThrowError().addClaimValidatorFromOtherRecipe(
        MultiFactorAuthClaim.validators.hasCompletedMFARequirementsForAuth()
      );
    });
    this.querier = Querier.getNewInstanceOrThrowError(recipeId);
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
    if (env.TEST_MODE !== "testing") {
      throw new Error("calling testing function in non testing env");
    }
    _Recipe.instance = void 0;
  }
};
_Recipe.instance = void 0;
_Recipe.RECIPE_ID = "multifactorauth";
let Recipe = _Recipe;
export {
  Recipe as default
};
