// @ts-nocheck
import type { APIInterface, APIOptions } from "../../types";
import type { UserContext } from "../../../../types";
type Response = {
    status: "OK" | "EMAIL_ALREADY_VERIFIED_ERROR";
};
export declare const userEmailVerifyTokenPost: (_: APIInterface, tenantId: string, options: APIOptions, userContext: UserContext) => Promise<Response>;
export {};
