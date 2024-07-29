// @ts-nocheck
import type { JWTVerifyGetKey } from "jose";
import type { RecipeInterface, TypeNormalisedInput } from "./types";
import { Querier } from "../../querier";
import type { NormalisedAppinfo } from "../../types";
export type Helpers = {
    querier: Querier;
    JWKS: JWTVerifyGetKey;
    config: TypeNormalisedInput;
    appInfo: NormalisedAppinfo;
    getRecipeImpl: () => RecipeInterface;
};
export default function getRecipeInterface(querier: Querier, config: TypeNormalisedInput, appInfo: NormalisedAppinfo, getRecipeImplAfterOverrides: () => RecipeInterface): RecipeInterface;
