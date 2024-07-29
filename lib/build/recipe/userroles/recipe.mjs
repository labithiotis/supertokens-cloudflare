import SuperTokensError from "../../error";
import { Querier } from "../../querier";
import RecipeModule from "../../recipeModule";
import RecipeImplementation from "./recipeImplementation";
import { validateAndNormaliseUserInput } from "./utils";
import OverrideableBuilder from "supertokens-js-override";
import { PostSuperTokensInitCallbacks } from "../../postSuperTokensInitCallbacks";
import SessionRecipe from "../session/recipe";
import { UserRoleClaim } from "./userRoleClaim";
import { PermissionClaim } from "./permissionClaim";
import { env } from "node:process";
const _Recipe = class _Recipe extends RecipeModule {
  constructor(recipeId, appInfo, isInServerlessEnv, config) {
    super(recipeId, appInfo);
    // This stub is required to implement RecipeModule
    this.handleAPIRequest = async (_, _tenantId, __, ___, ____, _____) => {
      throw new Error("Should never come here");
    };
    this.config = validateAndNormaliseUserInput(this, appInfo, config);
    this.isInServerlessEnv = isInServerlessEnv;
    {
      let builder = new OverrideableBuilder(RecipeImplementation(Querier.getNewInstanceOrThrowError(recipeId)));
      this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
    }
    PostSuperTokensInitCallbacks.addPostInitCallback(() => {
      if (!this.config.skipAddingRolesToAccessToken) {
        SessionRecipe.getInstanceOrThrowError().addClaimFromOtherRecipe(UserRoleClaim);
      }
      if (!this.config.skipAddingPermissionsToAccessToken) {
        SessionRecipe.getInstanceOrThrowError().addClaimFromOtherRecipe(PermissionClaim);
      }
    });
  }
  /* Init functions */
  static getInstanceOrThrowError() {
    if (_Recipe.instance !== void 0) {
      return _Recipe.instance;
    }
    throw new Error(
      "Initialisation not done. Did you forget to call the UserRoles.init or SuperTokens.init functions?"
    );
  }
  static init(config) {
    return (appInfo, isInServerlessEnv) => {
      if (_Recipe.instance === void 0) {
        _Recipe.instance = new _Recipe(_Recipe.RECIPE_ID, appInfo, isInServerlessEnv, config);
        return _Recipe.instance;
      } else {
        throw new Error("UserRoles recipe has already been initialised. Please check your code for bugs.");
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
    return [];
  }
  handleError(error2, _, __) {
    throw error2;
  }
  getAllCORSHeaders() {
    return [];
  }
  isErrorFromThisRecipe(err) {
    return SuperTokensError.isErrorFromSuperTokens(err) && err.fromRecipe === _Recipe.RECIPE_ID;
  }
};
_Recipe.RECIPE_ID = "userroles";
_Recipe.instance = void 0;
let Recipe = _Recipe;
export {
  Recipe as default
};
