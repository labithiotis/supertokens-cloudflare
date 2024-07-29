import UserRolesRecipe from "../../../userroles/recipe";
import UserRoles from "../../../userroles";
import STError from "../../../../error";
const addRoleToUser = async (_, tenantId, options, __) => {
  try {
    UserRolesRecipe.getInstanceOrThrowError();
  } catch (_2) {
    return {
      status: "FEATURE_NOT_ENABLED_ERROR"
    };
  }
  const requestBody = await options.req.getJSONBody();
  const userId = requestBody.userId;
  const role = requestBody.role;
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
  const response = await UserRoles.addRoleToUser(tenantId, userId, role);
  return response;
};
var addRoleToUser_default = addRoleToUser;
export {
  addRoleToUser_default as default
};
