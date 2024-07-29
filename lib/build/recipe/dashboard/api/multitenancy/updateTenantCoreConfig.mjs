import MultitenancyRecipe from "../../../multitenancy/recipe";
async function updateTenantCoreConfig(_, tenantId, options, userContext) {
  const requestBody = await options.req.getJSONBody();
  const { name, value } = requestBody;
  const mtRecipe = MultitenancyRecipe.getInstance();
  const tenantRes = await mtRecipe.recipeInterfaceImpl.getTenant({ tenantId, userContext });
  if (tenantRes === void 0) {
    return {
      status: "UNKNOWN_TENANT_ERROR"
    };
  }
  try {
    await mtRecipe.recipeInterfaceImpl.createOrUpdateTenant({
      tenantId,
      config: {
        coreConfig: {
          [name]: value
        }
      },
      userContext
    });
  } catch (err) {
    const errMsg = err == null ? void 0 : err.message;
    if (errMsg.includes("SuperTokens core threw an error for a ") && errMsg.includes("with status code: 400")) {
      return {
        status: "INVALID_CONFIG_ERROR",
        message: errMsg.split(" and message: ")[1]
      };
    }
    throw err;
  }
  return {
    status: "OK"
  };
}
export {
  updateTenantCoreConfig as default
};
