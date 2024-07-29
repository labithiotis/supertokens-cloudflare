import STError from "../../../../error";
import EmailVerification from "../../../emailverification";
import EmailVerificationRecipe from "../../../emailverification/recipe";
import RecipeUserId from "../../../../recipeUserId";
const userEmailVerifyGet = async (_, ___, options, userContext) => {
  const req = options.req;
  const recipeUserId = req.getKeyValueFromQuery("recipeUserId");
  if (recipeUserId === void 0) {
    throw new STError({
      message: "Missing required parameter 'recipeUserId'",
      type: STError.BAD_INPUT_ERROR
    });
  }
  try {
    EmailVerificationRecipe.getInstanceOrThrowError();
  } catch (e) {
    return {
      status: "FEATURE_NOT_ENABLED_ERROR"
    };
  }
  const response = await EmailVerification.isEmailVerified(new RecipeUserId(recipeUserId), void 0, userContext);
  return {
    status: "OK",
    isVerified: response
  };
};
export {
  userEmailVerifyGet
};
