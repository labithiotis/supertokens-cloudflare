import UserRoles from "../../../userroles";
import UserRolesRecipe from "../../../userroles/recipe";
import STError from "../../../../error";
const getRolesForUser = async (_, tenantId, options, __) => {
    const userId = options.req.getKeyValueFromQuery("userId");
    try {
        UserRolesRecipe.getInstanceOrThrowError();
    }
    catch (_) {
        return {
            status: "FEATURE_NOT_ENABLED_ERROR",
        };
    }
    if (userId === undefined || typeof userId !== "string") {
        throw new STError({
            message: "Required parameter 'userId' is missing or has an invalid type",
            type: STError.BAD_INPUT_ERROR,
        });
    }
    const response = await UserRoles.getRolesForUser(tenantId, userId);
    return response;
};
export default getRolesForUser;
