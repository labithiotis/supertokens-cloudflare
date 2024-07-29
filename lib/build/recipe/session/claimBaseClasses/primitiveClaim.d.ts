// @ts-nocheck
import RecipeUserId from "../../../recipeUserId";
import type { JSONObject, JSONPrimitive, UserContext } from "../../../types";
import type { SessionClaimValidator } from "../types";
import { SessionClaim } from "../types";
export declare class PrimitiveClaim<T extends JSONPrimitive> extends SessionClaim<T> {
    readonly fetchValue: (userId: string, recipeUserId: RecipeUserId, tenantId: string, currentPayload: JSONObject | undefined, userContext: UserContext) => Promise<T | undefined> | T | undefined;
    readonly defaultMaxAgeInSeconds: number | undefined;
    constructor(config: {
        key: string;
        fetchValue: SessionClaim<T>["fetchValue"];
        defaultMaxAgeInSeconds?: number;
    });
    addToPayload_internal(payload: any, value: T, _userContext: UserContext): any;
    removeFromPayloadByMerge_internal(payload: any, _userContext: UserContext): any;
    removeFromPayload(payload: any, _userContext: UserContext): any;
    getValueFromPayload(payload: any, _userContext: UserContext): T | undefined;
    getLastRefetchTime(payload: any, _userContext: UserContext): number | undefined;
    validators: {
        hasValue: (val: T, maxAgeInSeconds?: number | undefined, id?: string) => SessionClaimValidator;
    };
}
