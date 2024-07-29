import STError from "../../../../error";
import EmailVerification from "../../../emailverification";
import { convertToRecipeUserId, getUser } from "../../../..";
const userEmailVerifyTokenPost = async (_, tenantId, options, userContext) => {
  const requestBody = await options.req.getJSONBody();
  const recipeUserId = requestBody.recipeUserId;
  if (recipeUserId === void 0 || typeof recipeUserId !== "string") {
    throw new STError({
      message: "Required parameter 'recipeUserId' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  const user = await getUser(recipeUserId, userContext);
  if (!user) {
    throw new STError({
      message: "Unknown 'recipeUserId'",
      type: STError.BAD_INPUT_ERROR
    });
  }
  return await EmailVerification.sendEmailVerificationEmail(
    tenantId,
    user.id,
    convertToRecipeUserId(recipeUserId),
    void 0,
    userContext
  );
};
export {
  userEmailVerifyTokenPost
};
