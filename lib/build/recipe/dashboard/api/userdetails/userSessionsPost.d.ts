// @ts-nocheck
import type { APIInterface, APIOptions } from "../../types";
import type { UserContext } from "../../../../types";
type Response = {
    status: "OK";
};
export declare const userSessionsPost: (_: APIInterface, ___: string, options: APIOptions, userContext: UserContext) => Promise<Response>;
export {};
