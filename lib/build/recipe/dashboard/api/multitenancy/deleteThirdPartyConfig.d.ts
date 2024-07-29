// @ts-nocheck
import type { APIInterface, APIOptions } from "../../types";
import type { UserContext } from "../../../../types";
export type Response = {
    status: "OK";
    didConfigExist: boolean;
} | {
    status: "UNKNOWN_TENANT_ERROR";
};
export default function deleteThirdPartyConfig(_: APIInterface, tenantId: string, options: APIOptions, userContext: UserContext): Promise<Response>;
