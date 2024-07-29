import SuperTokensError from "../../error";
import NormalisedURLPath from "../../normalisedURLPath";
import { Querier } from "../../querier";
import RecipeModule from "../../recipeModule";
import getJWKS from "./api/getJWKS";
import APIImplementation from "./api/implementation";
import { GET_JWKS_API } from "./constants";
import RecipeImplementation from "./recipeImplementation";
import { validateAndNormaliseUserInput } from "./utils";
import OverrideableBuilder from "supertokens-js-override";
import { env } from "node:process";
const _Recipe = class _Recipe extends RecipeModule {
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
      return await getJWKS(this.apiImpl, options, userContext);
    };
    this.config = validateAndNormaliseUserInput(this, appInfo, config);
    this.isInServerlessEnv = isInServerlessEnv;
    {
      let builder = new OverrideableBuilder(
        RecipeImplementation(Querier.getNewInstanceOrThrowError(recipeId), this.config, appInfo)
      );
      this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
    }
    {
      let builder = new OverrideableBuilder(APIImplementation());
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
    if (env.TEST_MODE !== "testing") {
      throw new Error("calling testing function in non testing env");
    }
    _Recipe.instance = void 0;
  }
  /* RecipeModule functions */
  getAPIsHandled() {
    return [
      {
        method: "get",
        pathWithoutApiBasePath: new NormalisedURLPath(GET_JWKS_API),
        id: GET_JWKS_API,
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
    return SuperTokensError.isErrorFromSuperTokens(err) && err.fromRecipe === _Recipe.RECIPE_ID;
  }
};
_Recipe.RECIPE_ID = "jwt";
_Recipe.instance = void 0;
let Recipe = _Recipe;
export {
  Recipe as default
};
