import STError from "../../../../error";
import EmailPassword from "../../../emailpassword";
import RecipeUserId from "../../../../recipeUserId";
const userPasswordPut = async (_, tenantId, options, userContext) => {
  const requestBody = await options.req.getJSONBody();
  const recipeUserId = requestBody.recipeUserId;
  const newPassword = requestBody.newPassword;
  if (recipeUserId === void 0 || typeof recipeUserId !== "string") {
    throw new STError({
      message: "Required parameter 'recipeUserId' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  if (newPassword === void 0 || typeof newPassword !== "string") {
    throw new STError({
      message: "Required parameter 'newPassword' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  const updateResponse = await EmailPassword.updateEmailOrPassword({
    recipeUserId: new RecipeUserId(recipeUserId),
    password: newPassword,
    tenantIdForPasswordPolicy: tenantId,
    userContext
  });
  if (updateResponse.status === "UNKNOWN_USER_ID_ERROR" || updateResponse.status === "EMAIL_ALREADY_EXISTS_ERROR" || updateResponse.status === "EMAIL_CHANGE_NOT_ALLOWED_ERROR") {
    throw new Error("Should never come here");
  } else if (updateResponse.status === "PASSWORD_POLICY_VIOLATED_ERROR") {
    return {
      status: "INVALID_PASSWORD_ERROR",
      error: updateResponse.failureReason
    };
  }
  return {
    status: "OK"
  };
};
export {
  userPasswordPut
};
