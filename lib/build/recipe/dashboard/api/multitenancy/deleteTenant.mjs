import Multitenancy from "../../../multitenancy";
async function deleteTenant(_, tenantId, __, userContext) {
  try {
    const deleteTenantRes = await Multitenancy.deleteTenant(tenantId, userContext);
    return deleteTenantRes;
  } catch (err) {
    const errMsg = err == null ? void 0 : err.message;
    if (errMsg.includes("SuperTokens core threw an error for a ") && errMsg.includes("with status code: 403")) {
      return {
        status: "CANNOT_DELETE_PUBLIC_TENANT_ERROR"
      };
    }
    throw err;
  }
}
export {
  deleteTenant as default
};
