import UserRolesRecipe from "../../../userroles/recipe";
import UserRoles from "../../../userroles";
import STError from "../../../../error";
const removeUserRole = async (_, tenantId, options, __) => {
  try {
    UserRolesRecipe.getInstanceOrThrowError();
  } catch (_2) {
    return {
      status: "FEATURE_NOT_ENABLED_ERROR"
    };
  }
  const userId = options.req.getKeyValueFromQuery("userId");
  const role = options.req.getKeyValueFromQuery("role");
  if (role === void 0 || typeof role !== "string") {
    throw new STError({
      message: "Required parameter 'role' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  if (userId === void 0 || typeof userId !== "string") {
    throw new STError({
      message: "Required parameter 'userId' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  const response = await UserRoles.removeUserRole(tenantId, userId, role);
  return response;
};
var removeUserRole_default = removeUserRole;
export {
  removeUserRole_default as default
};
