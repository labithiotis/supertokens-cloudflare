// @ts-nocheck
import type { APIInterface, APIOptions } from "../types";
import type { UserContext } from "../../../types";
export type Response = {
    status: "OK";
};
export default function analyticsPost(_: APIInterface, ___: string, options: APIOptions, userContext: UserContext): Promise<Response>;
