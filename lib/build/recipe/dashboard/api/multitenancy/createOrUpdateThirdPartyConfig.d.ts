// @ts-nocheck
import type { APIInterface, APIOptions } from "../../types";
import type { UserContext } from "../../../../types";
export type Response = {
    status: "OK";
    createdNew: boolean;
} | {
    status: "UNKNOWN_TENANT_ERROR";
} | {
    status: "BOXY_ERROR";
    message: string;
};
export default function createOrUpdateThirdPartyConfig(_: APIInterface, tenantId: string, options: APIOptions, userContext: UserContext): Promise<Response>;
