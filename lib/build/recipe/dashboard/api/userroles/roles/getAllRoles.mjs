import UserRoles from "../../../../userroles";
import UserRolesRecipe from "../../../../userroles/recipe";
const getAllRoles = async (_, __, ____) => {
  try {
    UserRolesRecipe.getInstanceOrThrowError();
  } catch (_2) {
    return {
      status: "FEATURE_NOT_ENABLED_ERROR"
    };
  }
  const response = await UserRoles.getAllRoles();
  return {
    status: "OK",
    roles: response.roles
  };
};
var getAllRoles_default = getAllRoles;
export {
  getAllRoles_default as default
};
