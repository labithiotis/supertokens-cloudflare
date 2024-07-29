import UserRolesRecipe from "../../../../userroles/recipe";
import UserRoles from "../../../../userroles";
import STError from "../../../../../error";
const deleteRole = async (_, ___, options, __) => {
  try {
    UserRolesRecipe.getInstanceOrThrowError();
  } catch (_2) {
    return {
      status: "FEATURE_NOT_ENABLED_ERROR"
    };
  }
  const role = options.req.getKeyValueFromQuery("role");
  if (role === void 0 || typeof role !== "string") {
    throw new STError({
      message: "Required parameter 'role' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  const response = await UserRoles.deleteRole(role);
  return response;
};
var deleteRole_default = deleteRole;
export {
  deleteRole_default as default
};
