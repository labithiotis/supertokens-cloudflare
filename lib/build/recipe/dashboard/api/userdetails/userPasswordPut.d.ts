// @ts-nocheck
import type { APIInterface, APIOptions } from "../../types";
import type { UserContext } from "../../../../types";
declare type Response = {
    status: "OK";
} | {
    status: "INVALID_PASSWORD_ERROR";
    error: string;
};
export declare const userPasswordPut: (_: APIInterface, tenantId: string, options: APIOptions, userContext: UserContext) => Promise<Response>;
export {};
