import UserRolesRecipe from "../../../../userroles/recipe";
import UserRoles from "../../../../userroles";
import STError from "../../../../../error";
const removePermissionsFromRole = async (_, ___, options, __) => {
  try {
    UserRolesRecipe.getInstanceOrThrowError();
  } catch (_2) {
    return {
      status: "FEATURE_NOT_ENABLED_ERROR"
    };
  }
  const requestBody = await options.req.getJSONBody();
  const role = requestBody.role;
  const permissions = requestBody.permissions;
  if (role === void 0 || typeof role !== "string") {
    throw new STError({
      message: "Required parameter 'role' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  if (permissions === void 0 || Array.isArray(permissions) === false) {
    if (role === void 0) {
      throw new STError({
        message: "Required parameter 'role' is missing or has an invalid type",
        type: STError.BAD_INPUT_ERROR
      });
    }
  }
  const response = await UserRoles.removePermissionsFromRole(role, permissions);
  return response;
};
var removePermissions_default = removePermissionsFromRole;
export {
  removePermissions_default as default
};
