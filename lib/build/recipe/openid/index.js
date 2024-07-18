import { getUserContext } from "../../utils";
import OpenIdRecipe from "./recipe";
export default class OpenIdRecipeWrapper {
    static getOpenIdDiscoveryConfiguration(userContext) {
        return OpenIdRecipe.getInstanceOrThrowError().recipeImplementation.getOpenIdDiscoveryConfiguration({
            userContext: getUserContext(userContext),
        });
    }
    static createJWT(payload, validitySeconds, useStaticSigningKey, userContext) {
        return OpenIdRecipe.getInstanceOrThrowError().jwtRecipe.recipeInterfaceImpl.createJWT({
            payload,
            validitySeconds,
            useStaticSigningKey,
            userContext: getUserContext(userContext),
        });
    }
    static getJWKS(userContext) {
        return OpenIdRecipe.getInstanceOrThrowError().jwtRecipe.recipeInterfaceImpl.getJWKS({
            userContext: getUserContext(userContext),
        });
    }
}
OpenIdRecipeWrapper.init = OpenIdRecipe.init;
export let init = OpenIdRecipeWrapper.init;
export let getOpenIdDiscoveryConfiguration = OpenIdRecipeWrapper.getOpenIdDiscoveryConfiguration;
export let createJWT = OpenIdRecipeWrapper.createJWT;
export let getJWKS = OpenIdRecipeWrapper.getJWKS;
