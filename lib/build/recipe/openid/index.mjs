import { getUserContext } from "../../utils";
import OpenIdRecipe from "./recipe";
class OpenIdRecipeWrapper {
  static getOpenIdDiscoveryConfiguration(userContext) {
    return OpenIdRecipe.getInstanceOrThrowError().recipeImplementation.getOpenIdDiscoveryConfiguration({
      userContext: getUserContext(userContext)
    });
  }
  static createJWT(payload, validitySeconds, useStaticSigningKey, userContext) {
    return OpenIdRecipe.getInstanceOrThrowError().jwtRecipe.recipeInterfaceImpl.createJWT({
      payload,
      validitySeconds,
      useStaticSigningKey,
      userContext: getUserContext(userContext)
    });
  }
  static getJWKS(userContext) {
    return OpenIdRecipe.getInstanceOrThrowError().jwtRecipe.recipeInterfaceImpl.getJWKS({
      userContext: getUserContext(userContext)
    });
  }
}
OpenIdRecipeWrapper.init = OpenIdRecipe.init;
let init = OpenIdRecipeWrapper.init;
let getOpenIdDiscoveryConfiguration = OpenIdRecipeWrapper.getOpenIdDiscoveryConfiguration;
let createJWT = OpenIdRecipeWrapper.createJWT;
let getJWKS = OpenIdRecipeWrapper.getJWKS;
export {
  createJWT,
  OpenIdRecipeWrapper as default,
  getJWKS,
  getOpenIdDiscoveryConfiguration,
  init
};
