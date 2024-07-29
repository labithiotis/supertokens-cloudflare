import STError from "../../../../../error";
import EmailPassword from "../../../../emailpassword";
import EmailPasswordRecipe from "../../../../emailpassword/recipe";
const createEmailPasswordUser = async (_, tenantId, options, userContext) => {
  let emailPassword = void 0;
  try {
    emailPassword = EmailPasswordRecipe.getInstanceOrThrowError();
  } catch (error) {
    return {
      status: "FEATURE_NOT_ENABLED_ERROR"
    };
  }
  const requestBody = await options.req.getJSONBody();
  const email = requestBody.email;
  const password = requestBody.password;
  if (email === void 0 || typeof email !== "string") {
    throw new STError({
      message: "Required parameter 'email' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  if (password === void 0 || typeof password !== "string") {
    throw new STError({
      message: "Required parameter 'password' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  const emailFormField = emailPassword.config.signUpFeature.formFields.find((field) => field.id === "email");
  const validateEmailError = await emailFormField.validate(email, tenantId, userContext);
  if (validateEmailError !== void 0) {
    return {
      status: "EMAIL_VALIDATION_ERROR",
      message: validateEmailError
    };
  }
  const passwordFormField = emailPassword.config.signUpFeature.formFields.find((field) => field.id === "password");
  const validatePasswordError = await passwordFormField.validate(password, tenantId, userContext);
  if (validatePasswordError !== void 0) {
    return {
      status: "PASSWORD_VALIDATION_ERROR",
      message: validatePasswordError
    };
  }
  const response = await EmailPassword.signUp(tenantId, email, password);
  if (response.status === "OK" || response.status === "EMAIL_ALREADY_EXISTS_ERROR") {
    return response;
  } else {
    throw new Error(
      "This should never happen: EmailPassword.signUp threw a session user related error without passing a session"
    );
  }
};
export {
  createEmailPasswordUser
};
