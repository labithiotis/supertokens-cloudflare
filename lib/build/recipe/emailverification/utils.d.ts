// @ts-nocheck
import Recipe from "./recipe";
import type { TypeInput, TypeNormalisedInput } from "./types";
import type { NormalisedAppinfo, UserContext } from "../../types";
import { BaseRequest } from "../../framework";
export declare function validateAndNormaliseUserInput(_: Recipe, appInfo: NormalisedAppinfo, config: TypeInput): TypeNormalisedInput;
export declare function getEmailVerifyLink(input: {
    appInfo: NormalisedAppinfo;
    token: string;
    tenantId: string;
    request: BaseRequest | undefined;
    userContext: UserContext;
}): string;
