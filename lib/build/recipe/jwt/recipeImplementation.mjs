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
const defaultJWKSMaxAge = 60;
function getRecipeInterface(querier, config, appInfo) {
  return {
    createJWT: async function({
      payload,
      validitySeconds,
      useStaticSigningKey,
      userContext
    }) {
      if (validitySeconds === void 0) {
        validitySeconds = config.jwtValiditySeconds;
      }
      let response = await querier.sendPostRequest(
        new NormalisedURLPath("/recipe/jwt"),
        {
          payload: payload != null ? payload : {},
          validity: validitySeconds,
          useStaticSigningKey: useStaticSigningKey !== false,
          algorithm: "RS256",
          jwksDomain: appInfo.apiDomain.getAsStringDangerous()
        },
        userContext
      );
      if (response.status === "OK") {
        return {
          status: "OK",
          jwt: response.jwt
        };
      } else {
        return {
          status: "UNSUPPORTED_ALGORITHM_ERROR"
        };
      }
    },
    getJWKS: async function({ userContext }) {
      const { body, headers } = await querier.sendGetRequestWithResponseHeaders(
        new NormalisedURLPath("/.well-known/jwks.json"),
        {},
        userContext
      );
      let validityInSeconds = defaultJWKSMaxAge;
      const cacheControl = headers.get("Cache-Control");
      if (cacheControl) {
        const maxAgeHeader = cacheControl.match(/,?\s*max-age=(\d+)(?:,|$)/);
        if (maxAgeHeader !== null) {
          validityInSeconds = Number.parseInt(maxAgeHeader[1]);
          if (!Number.isSafeInteger(validityInSeconds)) {
            validityInSeconds = defaultJWKSMaxAge;
          }
        }
      }
      return __spreadValues({
        validityInSeconds
      }, body);
    }
  };
}
export {
  getRecipeInterface as default
};
