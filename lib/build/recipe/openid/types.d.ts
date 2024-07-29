// @ts-nocheck
import OverrideableBuilder from "supertokens-js-override";
import type { BaseRequest, BaseResponse } from "../../framework";
import NormalisedURLDomain from "../../normalisedURLDomain";
import NormalisedURLPath from "../../normalisedURLPath";
import type { RecipeInterface as JWTRecipeInterface, APIInterface as JWTAPIInterface, JsonWebKey } from "../jwt/types";
import type { GeneralErrorResponse, UserContext } from "../../types";
export type TypeInput = {
    issuer?: string;
    jwtValiditySeconds?: number;
    override?: {
        functions?: (originalImplementation: RecipeInterface, builder?: OverrideableBuilder<RecipeInterface>) => RecipeInterface;
        apis?: (originalImplementation: APIInterface, builder?: OverrideableBuilder<APIInterface>) => APIInterface;
        jwtFeature?: {
            functions?: (originalImplementation: JWTRecipeInterface, builder?: OverrideableBuilder<JWTRecipeInterface>) => JWTRecipeInterface;
            apis?: (originalImplementation: JWTAPIInterface, builder?: OverrideableBuilder<JWTAPIInterface>) => JWTAPIInterface;
        };
    };
};
export type TypeNormalisedInput = {
    issuerDomain: NormalisedURLDomain;
    issuerPath: NormalisedURLPath;
    jwtValiditySeconds?: number;
    override: {
        functions: (originalImplementation: RecipeInterface, builder?: OverrideableBuilder<RecipeInterface>) => RecipeInterface;
        apis: (originalImplementation: APIInterface, builder?: OverrideableBuilder<APIInterface>) => APIInterface;
        jwtFeature?: {
            functions?: (originalImplementation: JWTRecipeInterface, builder?: OverrideableBuilder<JWTRecipeInterface>) => JWTRecipeInterface;
            apis?: (originalImplementation: JWTAPIInterface, builder?: OverrideableBuilder<JWTAPIInterface>) => JWTAPIInterface;
        };
    };
};
export type APIOptions = {
    recipeImplementation: RecipeInterface;
    config: TypeNormalisedInput;
    recipeId: string;
    req: BaseRequest;
    res: BaseResponse;
};
export type APIInterface = {
    getOpenIdDiscoveryConfigurationGET: undefined | ((input: {
        options: APIOptions;
        userContext: UserContext;
    }) => Promise<{
        status: "OK";
        issuer: string;
        jwks_uri: string;
    } | GeneralErrorResponse>);
};
export type RecipeInterface = {
    getOpenIdDiscoveryConfiguration(input: {
        userContext: UserContext;
    }): Promise<{
        status: "OK";
        issuer: string;
        jwks_uri: string;
    }>;
    createJWT(input: {
        payload?: any;
        validitySeconds?: number;
        useStaticSigningKey?: boolean;
        userContext: UserContext;
    }): Promise<{
        status: "OK";
        jwt: string;
    } | {
        status: "UNSUPPORTED_ALGORITHM_ERROR";
    }>;
    getJWKS(input: {
        userContext: UserContext;
    }): Promise<{
        keys: JsonWebKey[];
    }>;
};
