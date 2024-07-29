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
import NormalisedURLPath from "../../normalisedURLPath";
import { GET_JWKS_API } from "../jwt/constants";
function getRecipeInterface(config, jwtRecipeImplementation) {
  return {
    getOpenIdDiscoveryConfiguration: async function() {
      let issuer = config.issuerDomain.getAsStringDangerous() + config.issuerPath.getAsStringDangerous();
      let jwks_uri = config.issuerDomain.getAsStringDangerous() + config.issuerPath.appendPath(new NormalisedURLPath(GET_JWKS_API)).getAsStringDangerous();
      return {
        status: "OK",
        issuer,
        jwks_uri
      };
    },
    createJWT: async function({
      payload,
      validitySeconds,
      useStaticSigningKey,
      userContext
    }) {
      payload = payload === void 0 || payload === null ? {} : payload;
      let issuer = config.issuerDomain.getAsStringDangerous() + config.issuerPath.getAsStringDangerous();
      return await jwtRecipeImplementation.createJWT({
        payload: __spreadValues({
          iss: issuer
        }, payload),
        useStaticSigningKey,
        validitySeconds,
        userContext
      });
    },
    getJWKS: async function(input) {
      return await jwtRecipeImplementation.getJWKS(input);
    }
  };
}
export {
  getRecipeInterface as default
};
