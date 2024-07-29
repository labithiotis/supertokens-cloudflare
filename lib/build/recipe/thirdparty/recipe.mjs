import RecipeModule from "../../recipeModule";
import { validateAndNormaliseUserInput } from "./utils";
import MultitenancyRecipe from "../multitenancy/recipe";
import STError from "./error";
import { SIGN_IN_UP_API, AUTHORISATION_API, APPLE_REDIRECT_HANDLER } from "./constants";
import NormalisedURLPath from "../../normalisedURLPath";
import signInUpAPI from "./api/signinup";
import authorisationUrlAPI from "./api/authorisationUrl";
import RecipeImplementation from "./recipeImplementation";
import APIImplementation from "./api/implementation";
import { Querier } from "../../querier";
import appleRedirectHandler from "./api/appleRedirect";
import OverrideableBuilder from "supertokens-js-override";
import { PostSuperTokensInitCallbacks } from "../../postSuperTokensInitCallbacks";
import { FactorIds } from "../multifactorauth";
import { env } from "node:process";
const _Recipe = class _Recipe extends RecipeModule {
  constructor(recipeId, appInfo, isInServerlessEnv, config, _recipes, _ingredients) {
    super(recipeId, appInfo);
    this.getAPIsHandled = () => {
      return [
        {
          method: "post",
          pathWithoutApiBasePath: new NormalisedURLPath(SIGN_IN_UP_API),
          id: SIGN_IN_UP_API,
          disabled: this.apiImpl.signInUpPOST === void 0
        },
        {
          method: "get",
          pathWithoutApiBasePath: new NormalisedURLPath(AUTHORISATION_API),
          id: AUTHORISATION_API,
          disabled: this.apiImpl.authorisationUrlGET === void 0
        },
        {
          method: "post",
          pathWithoutApiBasePath: new NormalisedURLPath(APPLE_REDIRECT_HANDLER),
          id: APPLE_REDIRECT_HANDLER,
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
      if (id === SIGN_IN_UP_API) {
        return await signInUpAPI(this.apiImpl, tenantId, options, userContext);
      } else if (id === AUTHORISATION_API) {
        return await authorisationUrlAPI(this.apiImpl, tenantId, options, userContext);
      } else if (id === APPLE_REDIRECT_HANDLER) {
        return await appleRedirectHandler(this.apiImpl, options, userContext);
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
      return STError.isErrorFromSuperTokens(err) && err.fromRecipe === _Recipe.RECIPE_ID;
    };
    this.config = validateAndNormaliseUserInput(appInfo, config);
    this.isInServerlessEnv = isInServerlessEnv;
    this.providers = this.config.signInAndUpFeature.providers;
    {
      let builder = new OverrideableBuilder(
        RecipeImplementation(Querier.getNewInstanceOrThrowError(recipeId), this.providers)
      );
      this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
    }
    {
      let builder = new OverrideableBuilder(APIImplementation());
      this.apiImpl = builder.override(this.config.override.apis).build();
    }
    PostSuperTokensInitCallbacks.addPostInitCallback(() => {
      const mtRecipe = MultitenancyRecipe.getInstance();
      if (mtRecipe !== void 0) {
        mtRecipe.staticThirdPartyProviders = this.config.signInAndUpFeature.providers;
        mtRecipe.allAvailableFirstFactors.push(FactorIds.THIRDPARTY);
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
    if (env.TEST_MODE !== "testing") {
      throw new Error("calling testing function in non testing env");
    }
    _Recipe.instance = void 0;
  }
};
_Recipe.instance = void 0;
_Recipe.RECIPE_ID = "thirdparty";
let Recipe = _Recipe;
export {
  Recipe as default
};
