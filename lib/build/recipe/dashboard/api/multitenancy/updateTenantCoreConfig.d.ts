// @ts-nocheck
import type { APIInterface, APIOptions } from "../../types";
import type { UserContext } from "../../../../types";
export type Response = {
    status: "OK";
} | {
    status: "UNKNOWN_TENANT_ERROR";
} | {
    status: "INVALID_CONFIG_ERROR";
    message: string;
};
export default function updateTenantCoreConfig(_: APIInterface, tenantId: string, options: APIOptions, userContext: UserContext): Promise<Response>;
