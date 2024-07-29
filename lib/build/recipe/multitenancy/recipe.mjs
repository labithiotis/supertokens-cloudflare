import OverrideableBuilder from "supertokens-js-override";
import NormalisedURLPath from "../../normalisedURLPath";
import { PostSuperTokensInitCallbacks } from "../../postSuperTokensInitCallbacks";
import { Querier } from "../../querier";
import RecipeModule from "../../recipeModule";
import STError from "../../error";
import RecipeImplementation from "./recipeImplementation";
import APIImplementation from "./api/implementation";
import SessionRecipe from "../session/recipe";
import { LOGIN_METHODS_API } from "./constants";
import { AllowedDomainsClaim } from "./allowedDomainsClaim";
import { validateAndNormaliseUserInput } from "./utils";
import loginMethodsAPI from "./api/loginMethods";
import { env } from "node:process";
const _Recipe = class _Recipe extends RecipeModule {
  constructor(recipeId, appInfo, isInServerlessEnv, config) {
    super(recipeId, appInfo);
    this.staticThirdPartyProviders = [];
    this.allAvailableFirstFactors = [];
    this.staticFirstFactors = void 0;
    // abstract instance functions below...............
    this.getAPIsHandled = () => {
      return [
        {
          method: "get",
          pathWithoutApiBasePath: new NormalisedURLPath(LOGIN_METHODS_API),
          id: LOGIN_METHODS_API,
          disabled: this.apiImpl.loginMethodsGET === void 0
        }
      ];
    };
    this.handleAPIRequest = async (id, tenantId, req, res, _, __, userContext) => {
      let options = {
        recipeImplementation: this.recipeInterfaceImpl,
        config: this.config,
        recipeId: this.getRecipeId(),
        isInServerlessEnv: this.isInServerlessEnv,
        req,
        res,
        staticThirdPartyProviders: this.staticThirdPartyProviders,
        allAvailableFirstFactors: this.allAvailableFirstFactors,
        staticFirstFactors: this.staticFirstFactors
      };
      if (id === LOGIN_METHODS_API) {
        return await loginMethodsAPI(this.apiImpl, tenantId, options, userContext);
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
    this.config = validateAndNormaliseUserInput(config);
    this.isInServerlessEnv = isInServerlessEnv;
    {
      let builder = new OverrideableBuilder(RecipeImplementation(Querier.getNewInstanceOrThrowError(recipeId)));
      this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
    }
    {
      let builder = new OverrideableBuilder(APIImplementation());
      this.apiImpl = builder.override(this.config.override.apis).build();
    }
    this.getAllowedDomainsForTenantId = this.config.getAllowedDomainsForTenantId;
  }
  static getInstanceOrThrowError() {
    if (_Recipe.instance !== void 0) {
      return _Recipe.instance;
    }
    throw new Error("Initialisation not done. Did you forget to call the Multitenancy.init function?");
  }
  static getInstance() {
    return _Recipe.instance;
  }
  static init(config) {
    return (appInfo, isInServerlessEnv) => {
      if (_Recipe.instance === void 0) {
        _Recipe.instance = new _Recipe(_Recipe.RECIPE_ID, appInfo, isInServerlessEnv, config);
        if (_Recipe.instance.getAllowedDomainsForTenantId !== void 0) {
          PostSuperTokensInitCallbacks.addPostInitCallback(() => {
            try {
              SessionRecipe.getInstanceOrThrowError().addClaimFromOtherRecipe(AllowedDomainsClaim);
            } catch (e) {
            }
          });
        }
        return _Recipe.instance;
      } else {
        throw new Error("Multitenancy recipe has already been initialised. Please check your code for bugs.");
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
_Recipe.RECIPE_ID = "multitenancy";
let Recipe = _Recipe;
export {
  Recipe as default
};
