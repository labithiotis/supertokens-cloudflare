import STError from "../../error";
import RecipeModule from "../../recipeModule";
import { validateAndNormaliseUserInput } from "./utils";
import JWTRecipe from "../jwt/recipe";
import OverrideableBuilder from "supertokens-js-override";
import RecipeImplementation from "./recipeImplementation";
import APIImplementation from "./api/implementation";
import NormalisedURLPath from "../../normalisedURLPath";
import { GET_DISCOVERY_CONFIG_URL } from "./constants";
import getOpenIdDiscoveryConfiguration from "./api/getOpenIdDiscoveryConfiguration";
import { env } from "node:process";
const _OpenIdRecipe = class _OpenIdRecipe extends RecipeModule {
  constructor(recipeId, appInfo, isInServerlessEnv, config) {
    super(recipeId, appInfo);
    this.getAPIsHandled = () => {
      return [
        {
          method: "get",
          pathWithoutApiBasePath: new NormalisedURLPath(GET_DISCOVERY_CONFIG_URL),
          id: GET_DISCOVERY_CONFIG_URL,
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
      if (id === GET_DISCOVERY_CONFIG_URL) {
        return await getOpenIdDiscoveryConfiguration(this.apiImpl, apiOptions, userContext);
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
      return STError.isErrorFromSuperTokens(err) && err.fromRecipe === _OpenIdRecipe.RECIPE_ID || this.jwtRecipe.isErrorFromThisRecipe(err);
    };
    this.config = validateAndNormaliseUserInput(appInfo, config);
    this.jwtRecipe = new JWTRecipe(recipeId, appInfo, isInServerlessEnv, {
      jwtValiditySeconds: this.config.jwtValiditySeconds,
      override: this.config.override.jwtFeature
    });
    let builder = new OverrideableBuilder(RecipeImplementation(this.config, this.jwtRecipe.recipeInterfaceImpl));
    this.recipeImplementation = builder.override(this.config.override.functions).build();
    let apiBuilder = new OverrideableBuilder(APIImplementation());
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
    if (env.TEST_MODE !== "testing") {
      throw new Error("calling testing function in non testing env");
    }
    _OpenIdRecipe.instance = void 0;
  }
};
_OpenIdRecipe.RECIPE_ID = "openid";
_OpenIdRecipe.instance = void 0;
let OpenIdRecipe = _OpenIdRecipe;
export {
  OpenIdRecipe as default
};
