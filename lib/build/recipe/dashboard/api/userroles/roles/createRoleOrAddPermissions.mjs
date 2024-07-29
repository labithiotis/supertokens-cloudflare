import UserRolesRecipe from "../../../../userroles/recipe";
import UserRoles from "../../../../userroles";
import STError from "../../../../../error";
const createRoleOrAddPermissions = async (_, __, options, ___) => {
  try {
    UserRolesRecipe.getInstanceOrThrowError();
  } catch (_2) {
    return {
      status: "FEATURE_NOT_ENABLED_ERROR"
    };
  }
  const requestBody = await options.req.getJSONBody();
  const permissions = requestBody.permissions;
  const role = requestBody.role;
  if (role === void 0 || typeof role !== "string") {
    throw new STError({
      message: "Required parameter 'role' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  if (permissions === void 0 || Array.isArray(permissions) === false) {
    throw new STError({
      message: "Required parameter 'permissions' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  const response = await UserRoles.createNewRoleOrAddPermissions(role, permissions);
  return response;
};
var createRoleOrAddPermissions_default = createRoleOrAddPermissions;
export {
  createRoleOrAddPermissions_default as default
};
