import STError from "../../../../error";
import UserMetaDataRecipe from "../../../usermetadata/recipe";
import UserMetaData from "../../../usermetadata";
export const userMetaDataGet = async (_, ___, options, userContext) => {
    const userId = options.req.getKeyValueFromQuery("userId");
    if (userId === undefined || userId === "") {
        throw new STError({
            message: "Missing required parameter 'userId'",
            type: STError.BAD_INPUT_ERROR,
        });
    }
    try {
        UserMetaDataRecipe.getInstanceOrThrowError();
    }
    catch (e) {
        return {
            status: "FEATURE_NOT_ENABLED_ERROR",
        };
    }
    const metaDataResponse = UserMetaData.getUserMetadata(userId, userContext);
    return {
        status: "OK",
        data: (await metaDataResponse).metadata,
    };
};
