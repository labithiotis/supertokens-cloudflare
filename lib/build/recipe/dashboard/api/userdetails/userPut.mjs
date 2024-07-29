import STError from "../../../../error";
import EmailPasswordRecipe from "../../../emailpassword/recipe";
import PasswordlessRecipe from "../../../passwordless/recipe";
import EmailPassword from "../../../emailpassword";
import Passwordless from "../../../passwordless";
import { isValidRecipeId, getUserForRecipeId } from "../../utils";
import UserMetadataRecipe from "../../../usermetadata/recipe";
import UserMetadata from "../../../usermetadata";
import { FORM_FIELD_EMAIL_ID } from "../../../emailpassword/constants";
import { defaultValidateEmail, defaultValidatePhoneNumber } from "../../../passwordless/utils";
import RecipeUserId from "../../../../recipeUserId";
const updateEmailForRecipeId = async (recipeId, recipeUserId, email, tenantId, userContext) => {
  if (recipeId === "emailpassword") {
    let emailFormFields = EmailPasswordRecipe.getInstanceOrThrowError().config.signUpFeature.formFields.filter(
      (field) => field.id === FORM_FIELD_EMAIL_ID
    );
    let validationError = await emailFormFields[0].validate(email, tenantId, userContext);
    if (validationError !== void 0) {
      return {
        status: "INVALID_EMAIL_ERROR",
        error: validationError
      };
    }
    const emailUpdateResponse = await EmailPassword.updateEmailOrPassword({
      recipeUserId,
      email,
      userContext
    });
    if (emailUpdateResponse.status === "EMAIL_ALREADY_EXISTS_ERROR") {
      return {
        status: "EMAIL_ALREADY_EXISTS_ERROR"
      };
    } else if (emailUpdateResponse.status === "EMAIL_CHANGE_NOT_ALLOWED_ERROR") {
      return {
        status: "EMAIL_CHANGE_NOT_ALLOWED_ERROR",
        reason: emailUpdateResponse.reason
      };
    } else if (emailUpdateResponse.status === "UNKNOWN_USER_ID_ERROR") {
      throw new Error("Should never come here");
    }
    return {
      status: "OK"
    };
  }
  if (recipeId === "passwordless") {
    let isValidEmail = true;
    let validationError = "";
    const passwordlessConfig = PasswordlessRecipe.getInstanceOrThrowError().config;
    if (passwordlessConfig.contactMethod === "PHONE") {
      const validationResult = await defaultValidateEmail(email);
      if (validationResult !== void 0) {
        isValidEmail = false;
        validationError = validationResult;
      }
    } else {
      const validationResult = await passwordlessConfig.validateEmailAddress(email, tenantId);
      if (validationResult !== void 0) {
        isValidEmail = false;
        validationError = validationResult;
      }
    }
    if (!isValidEmail) {
      return {
        status: "INVALID_EMAIL_ERROR",
        error: validationError
      };
    }
    const updateResult = await Passwordless.updateUser({
      recipeUserId,
      email,
      userContext
    });
    if (updateResult.status === "UNKNOWN_USER_ID_ERROR") {
      throw new Error("Should never come here");
    }
    if (updateResult.status === "EMAIL_ALREADY_EXISTS_ERROR") {
      return {
        status: "EMAIL_ALREADY_EXISTS_ERROR"
      };
    }
    if (updateResult.status === "EMAIL_CHANGE_NOT_ALLOWED_ERROR" || updateResult.status === "PHONE_NUMBER_CHANGE_NOT_ALLOWED_ERROR") {
      return {
        status: "EMAIL_CHANGE_NOT_ALLOWED_ERROR",
        reason: updateResult.reason
      };
    }
    return {
      status: "OK"
    };
  }
  throw new Error("Should never come here");
};
const updatePhoneForRecipeId = async (recipeUserId, phone, tenantId, userContext) => {
  let isValidPhone = true;
  let validationError = "";
  const passwordlessConfig = PasswordlessRecipe.getInstanceOrThrowError().config;
  if (passwordlessConfig.contactMethod === "EMAIL") {
    const validationResult = await defaultValidatePhoneNumber(phone);
    if (validationResult !== void 0) {
      isValidPhone = false;
      validationError = validationResult;
    }
  } else {
    const validationResult = await passwordlessConfig.validatePhoneNumber(phone, tenantId);
    if (validationResult !== void 0) {
      isValidPhone = false;
      validationError = validationResult;
    }
  }
  if (!isValidPhone) {
    return {
      status: "INVALID_PHONE_ERROR",
      error: validationError
    };
  }
  const updateResult = await Passwordless.updateUser({
    recipeUserId,
    phoneNumber: phone,
    userContext
  });
  if (updateResult.status === "UNKNOWN_USER_ID_ERROR") {
    throw new Error("Should never come here");
  }
  if (updateResult.status === "PHONE_NUMBER_ALREADY_EXISTS_ERROR") {
    return {
      status: "PHONE_ALREADY_EXISTS_ERROR"
    };
  }
  if (updateResult.status === "PHONE_NUMBER_CHANGE_NOT_ALLOWED_ERROR") {
    return {
      status: updateResult.status,
      reason: updateResult.reason
    };
  }
  return {
    status: "OK"
  };
};
const userPut = async (_, tenantId, options, userContext) => {
  const requestBody = await options.req.getJSONBody();
  const recipeUserId = requestBody.recipeUserId;
  const recipeId = requestBody.recipeId;
  const firstName = requestBody.firstName;
  const lastName = requestBody.lastName;
  const email = requestBody.email;
  const phone = requestBody.phone;
  if (recipeUserId === void 0 || typeof recipeUserId !== "string") {
    throw new STError({
      message: "Required parameter 'recipeUserId' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  if (recipeId === void 0 || typeof recipeId !== "string") {
    throw new STError({
      message: "Required parameter 'recipeId' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  if (!isValidRecipeId(recipeId)) {
    throw new STError({
      message: "Invalid recipe id",
      type: STError.BAD_INPUT_ERROR
    });
  }
  if (firstName === void 0 || typeof firstName !== "string") {
    throw new STError({
      message: "Required parameter 'firstName' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  if (lastName === void 0 || typeof lastName !== "string") {
    throw new STError({
      message: "Required parameter 'lastName' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  if (email === void 0 || typeof email !== "string") {
    throw new STError({
      message: "Required parameter 'email' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  if (phone === void 0 || typeof phone !== "string") {
    throw new STError({
      message: "Required parameter 'phone' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  let userResponse = await getUserForRecipeId(new RecipeUserId(recipeUserId), recipeId, userContext);
  if (userResponse.user === void 0 || userResponse.recipe === void 0) {
    throw new Error("Should never come here");
  }
  if (firstName.trim() !== "" || lastName.trim() !== "") {
    let isRecipeInitialised = false;
    try {
      UserMetadataRecipe.getInstanceOrThrowError();
      isRecipeInitialised = true;
    } catch (_2) {
    }
    if (isRecipeInitialised) {
      let metaDataUpdate = {};
      if (firstName.trim() !== "") {
        metaDataUpdate["first_name"] = firstName.trim();
      }
      if (lastName.trim() !== "") {
        metaDataUpdate["last_name"] = lastName.trim();
      }
      await UserMetadata.updateUserMetadata(userResponse.user.id, metaDataUpdate, userContext);
    }
  }
  if (email.trim() !== "") {
    const emailUpdateResponse = await updateEmailForRecipeId(
      userResponse.recipe,
      new RecipeUserId(recipeUserId),
      email.trim(),
      tenantId,
      userContext
    );
    if (emailUpdateResponse.status === "EMAIL_CHANGE_NOT_ALLOWED_ERROR") {
      return {
        error: emailUpdateResponse.reason,
        status: emailUpdateResponse.status
      };
    }
    if (emailUpdateResponse.status !== "OK") {
      return emailUpdateResponse;
    }
  }
  if (phone.trim() !== "") {
    const phoneUpdateResponse = await updatePhoneForRecipeId(
      new RecipeUserId(recipeUserId),
      phone.trim(),
      tenantId,
      userContext
    );
    if (phoneUpdateResponse.status === "PHONE_NUMBER_CHANGE_NOT_ALLOWED_ERROR") {
      return {
        error: phoneUpdateResponse.reason,
        status: phoneUpdateResponse.status
      };
    }
    if (phoneUpdateResponse.status !== "OK") {
      return phoneUpdateResponse;
    }
  }
  return {
    status: "OK"
  };
};
export {
  userPut
};
