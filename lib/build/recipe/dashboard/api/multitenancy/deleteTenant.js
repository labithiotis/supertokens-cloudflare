import Multitenancy from "../../../multitenancy";
export default async function deleteTenant(_, tenantId, __, userContext) {
    var _a;
    try {
        const deleteTenantRes = await Multitenancy.deleteTenant(tenantId, userContext);
        return deleteTenantRes;
    }
    catch (err) {
        const errMsg = (_a = err) === null || _a === void 0 ? void 0 : _a.message;
        if (errMsg.includes("SuperTokens core threw an error for a ") && errMsg.includes("with status code: 403")) {
            return {
                status: "CANNOT_DELETE_PUBLIC_TENANT_ERROR",
            };
        }
        throw err;
    }
}
