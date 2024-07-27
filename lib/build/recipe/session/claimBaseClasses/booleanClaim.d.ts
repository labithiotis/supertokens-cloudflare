// @ts-nocheck
import type { SessionClaimValidator } from "../types";
import { SessionClaim } from "../types";
import { PrimitiveClaim } from "./primitiveClaim";
export declare class BooleanClaim extends PrimitiveClaim<boolean> {
    constructor(conf: {
        key: string;
        fetchValue: SessionClaim<boolean>["fetchValue"];
        defaultMaxAgeInSeconds?: number;
    });
    validators: PrimitiveClaim<boolean>["validators"] & {
        isTrue: (maxAge?: number, id?: string) => SessionClaimValidator;
        isFalse: (maxAge?: number, id?: string) => SessionClaimValidator;
    };
}
