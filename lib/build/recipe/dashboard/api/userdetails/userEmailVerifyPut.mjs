import STError from "../../../../error";
import EmailVerification from "../../../emailverification";
import RecipeUserId from "../../../../recipeUserId";
const userEmailVerifyPut = async (_, tenantId, options, userContext) => {
  const requestBody = await options.req.getJSONBody();
  const recipeUserId = requestBody.recipeUserId;
  const verified = requestBody.verified;
  if (recipeUserId === void 0 || typeof recipeUserId !== "string") {
    throw new STError({
      message: "Required parameter 'recipeUserId' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  if (verified === void 0 || typeof verified !== "boolean") {
    throw new STError({
      message: "Required parameter 'verified' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  if (verified) {
    const tokenResponse = await EmailVerification.createEmailVerificationToken(
      tenantId,
      new RecipeUserId(recipeUserId),
      void 0,
      userContext
    );
    if (tokenResponse.status === "EMAIL_ALREADY_VERIFIED_ERROR") {
      return {
        status: "OK"
      };
    }
    const verifyResponse = await EmailVerification.verifyEmailUsingToken(
      tenantId,
      tokenResponse.token,
      void 0,
      userContext
    );
    if (verifyResponse.status === "EMAIL_VERIFICATION_INVALID_TOKEN_ERROR") {
      throw new Error("Should not come here");
    }
  } else {
    await EmailVerification.unverifyEmail(new RecipeUserId(recipeUserId), void 0, userContext);
  }
  return {
    status: "OK"
  };
};
export {
  userEmailVerifyPut
};
