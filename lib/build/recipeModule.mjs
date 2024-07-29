import NormalisedURLPath from "./normalisedURLPath";
import { DEFAULT_TENANT_ID } from "./recipe/multitenancy/constants";
import MultitenancyRecipe from "./recipe/multitenancy/recipe";
class RecipeModule {
  constructor(recipeId, appInfo) {
    this.getRecipeId = () => {
      return this.recipeId;
    };
    this.getAppInfo = () => {
      return this.appInfo;
    };
    this.returnAPIIdIfCanHandleRequest = async (path, method, userContext) => {
      let apisHandled = this.getAPIsHandled();
      const basePathStr = this.appInfo.apiBasePath.getAsStringDangerous();
      const pathStr = path.getAsStringDangerous();
      const regex = new RegExp(`^${basePathStr}(?:/([a-zA-Z0-9-]+))?(/.*)$`);
      const match = pathStr.match(regex);
      let tenantId = DEFAULT_TENANT_ID;
      let remainingPath = void 0;
      if (match) {
        tenantId = match[1];
        remainingPath = new NormalisedURLPath(match[2]);
      }
      const mtRecipe = MultitenancyRecipe.getInstanceOrThrowError();
      for (let i = 0; i < apisHandled.length; i++) {
        let currAPI = apisHandled[i];
        if (!currAPI.disabled && currAPI.method === method) {
          if (this.appInfo.apiBasePath.appendPath(currAPI.pathWithoutApiBasePath).equals(path)) {
            const finalTenantId = await mtRecipe.recipeInterfaceImpl.getTenantId({
              tenantIdFromFrontend: DEFAULT_TENANT_ID,
              userContext
            });
            return { id: currAPI.id, tenantId: finalTenantId };
          } else if (remainingPath !== void 0 && this.appInfo.apiBasePath.appendPath(currAPI.pathWithoutApiBasePath).equals(this.appInfo.apiBasePath.appendPath(remainingPath))) {
            const finalTenantId = await mtRecipe.recipeInterfaceImpl.getTenantId({
              tenantIdFromFrontend: tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId,
              userContext
            });
            return { id: currAPI.id, tenantId: finalTenantId };
          }
        }
      }
      return void 0;
    };
    this.recipeId = recipeId;
    this.appInfo = appInfo;
  }
}
export {
  RecipeModule as default
};
