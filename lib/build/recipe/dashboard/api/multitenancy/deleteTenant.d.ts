// @ts-nocheck
import type { APIInterface, APIOptions } from "../../types";
import type { UserContext } from "../../../../types";
export type Response = {
    status: "OK";
    didExist: boolean;
} | {
    status: "CANNOT_DELETE_PUBLIC_TENANT_ERROR";
};
export default function deleteTenant(_: APIInterface, tenantId: string, __: APIOptions, userContext: UserContext): Promise<Response>;
