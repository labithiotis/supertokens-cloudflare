import UserRolesRecipe from "../../../../userroles/recipe";
import UserRoles from "../../../../userroles";
import STError from "../../../../../error";
const getPermissionsForRole = async (_, ___, options, __) => {
    try {
        UserRolesRecipe.getInstanceOrThrowError();
    }
    catch (_) {
        return {
            status: "FEATURE_NOT_ENABLED_ERROR",
        };
    }
    const role = options.req.getKeyValueFromQuery("role");
    if (role === undefined || typeof role !== "string") {
        throw new STError({
            message: "Required parameter 'role' is missing or has an invalid type",
            type: STError.BAD_INPUT_ERROR,
        });
    }
    const response = await UserRoles.getPermissionsForRole(role);
    return response;
};
export default getPermissionsForRole;
