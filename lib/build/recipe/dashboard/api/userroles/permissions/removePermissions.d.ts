// @ts-nocheck
import type { APIInterface, APIOptions } from "../../../types";
declare const removePermissionsFromRole: (_: APIInterface, ___: string, options: APIOptions, __: any) => Promise<{
    status: "OK" | "UNKNOWN_ROLE_ERROR" | "FEATURE_NOT_ENABLED_ERROR";
}>;
export default removePermissionsFromRole;
