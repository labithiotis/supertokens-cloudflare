import STError from "../../../../error";
import EmailVerification from "../../../emailverification";
import EmailVerificationRecipe from "../../../emailverification/recipe";
import RecipeUserId from "../../../../recipeUserId";
export const userEmailVerifyGet = async (_, ___, options, userContext) => {
    const req = options.req;
    const recipeUserId = req.getKeyValueFromQuery("recipeUserId");
    if (recipeUserId === undefined) {
        throw new STError({
            message: "Missing required parameter 'recipeUserId'",
            type: STError.BAD_INPUT_ERROR,
        });
    }
    try {
        EmailVerificationRecipe.getInstanceOrThrowError();
    }
    catch (e) {
        return {
            status: "FEATURE_NOT_ENABLED_ERROR",
        };
    }
    const response = await EmailVerification.isEmailVerified(new RecipeUserId(recipeUserId), undefined, userContext);
    return {
        status: "OK",
        isVerified: response,
    };
};
