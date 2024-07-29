import { getUserContext } from "../../utils";
import Recipe from "./recipe";
class Wrapper {
  static async createJWT(payload, validitySeconds, useStaticSigningKey, userContext) {
    return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.createJWT({
      payload,
      validitySeconds,
      useStaticSigningKey,
      userContext: getUserContext(userContext)
    });
  }
  static async getJWKS(userContext) {
    return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getJWKS({
      userContext: getUserContext(userContext)
    });
  }
}
Wrapper.init = Recipe.init;
let init = Wrapper.init;
let createJWT = Wrapper.createJWT;
let getJWKS = Wrapper.getJWKS;
export {
  createJWT,
  Wrapper as default,
  getJWKS,
  init
};
