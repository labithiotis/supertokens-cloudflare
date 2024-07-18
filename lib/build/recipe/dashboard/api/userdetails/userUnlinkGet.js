import STError from "../../../../error";
import AccountLinking from "../../../accountlinking";
import RecipeUserId from "../../../../recipeUserId";
export const userUnlink = async (_, ___, options, userContext) => {
    const recipeUserId = options.req.getKeyValueFromQuery("recipeUserId");
    if (recipeUserId === undefined) {
        throw new STError({
            message: "Required field recipeUserId is missing",
            type: STError.BAD_INPUT_ERROR,
        });
    }
    await AccountLinking.unlinkAccount(new RecipeUserId(recipeUserId), userContext);
    return {
        status: "OK",
    };
};
