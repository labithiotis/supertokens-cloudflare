// @ts-nocheck
import type { APIInterface, APIOptions } from "../types";
import type { UserContext } from "../../../types";
export type Response = {
    status: "OK";
    count: number;
};
export default function usersCountGet(_: APIInterface, tenantId: string, __: APIOptions, userContext: UserContext): Promise<Response>;
