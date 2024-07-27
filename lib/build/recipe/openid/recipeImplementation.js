import NormalisedURLPath from "../../normalisedURLPath";
import { GET_JWKS_API } from "../jwt/constants";
export default function getRecipeInterface(config, jwtRecipeImplementation) {
    return {
        getOpenIdDiscoveryConfiguration: async function () {
            let issuer = config.issuerDomain.getAsStringDangerous() + config.issuerPath.getAsStringDangerous();
            let jwks_uri = config.issuerDomain.getAsStringDangerous() +
                config.issuerPath.appendPath(new NormalisedURLPath(GET_JWKS_API)).getAsStringDangerous();
            return {
                status: "OK",
                issuer,
                jwks_uri,
            };
        },
        createJWT: async function ({ payload, validitySeconds, useStaticSigningKey, userContext, }) {
            payload = payload === undefined || payload === null ? {} : payload;
            let issuer = config.issuerDomain.getAsStringDangerous() + config.issuerPath.getAsStringDangerous();
            return await jwtRecipeImplementation.createJWT({
                payload: Object.assign({ iss: issuer }, payload),
                useStaticSigningKey,
                validitySeconds,
                userContext,
            });
        },
        getJWKS: async function (input) {
            return await jwtRecipeImplementation.getJWKS(input);
        },
    };
}
