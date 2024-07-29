"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var userPut_exports = {};
__export(userPut_exports, {
  userPut: () => userPut
});
module.exports = __toCommonJS(userPut_exports);
var import_error = __toESM(require("../../../../error"), 1);
var import_recipe = __toESM(require("../../../emailpassword/recipe"), 1);
var import_recipe2 = __toESM(require("../../../passwordless/recipe"), 1);
var import_emailpassword = __toESM(require("../../../emailpassword"), 1);
var import_passwordless = __toESM(require("../../../passwordless"), 1);
var import_utils = require("../../utils");
var import_recipe3 = __toESM(require("../../../usermetadata/recipe"), 1);
var import_usermetadata = __toESM(require("../../../usermetadata"), 1);
var import_constants = require("../../../emailpassword/constants");
var import_utils2 = require("../../../passwordless/utils");
var import_recipeUserId = __toESM(require("../../../../recipeUserId"), 1);
const updateEmailForRecipeId = async (recipeId, recipeUserId, email, tenantId, userContext) => {
  if (recipeId === "emailpassword") {
    let emailFormFields = import_recipe.default.getInstanceOrThrowError().config.signUpFeature.formFields.filter(
      (field) => field.id === import_constants.FORM_FIELD_EMAIL_ID
    );
    let validationError = await emailFormFields[0].validate(email, tenantId, userContext);
    if (validationError !== void 0) {
      return {
        status: "INVALID_EMAIL_ERROR",
        error: validationError
      };
    }
    const emailUpdateResponse = await import_emailpassword.default.updateEmailOrPassword({
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
    const passwordlessConfig = import_recipe2.default.getInstanceOrThrowError().config;
    if (passwordlessConfig.contactMethod === "PHONE") {
      const validationResult = await (0, import_utils2.defaultValidateEmail)(email);
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
    const updateResult = await import_passwordless.default.updateUser({
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
  const passwordlessConfig = import_recipe2.default.getInstanceOrThrowError().config;
  if (passwordlessConfig.contactMethod === "EMAIL") {
    const validationResult = await (0, import_utils2.defaultValidatePhoneNumber)(phone);
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
  const updateResult = await import_passwordless.default.updateUser({
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
    throw new import_error.default({
      message: "Required parameter 'recipeUserId' is missing or has an invalid type",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  if (recipeId === void 0 || typeof recipeId !== "string") {
    throw new import_error.default({
      message: "Required parameter 'recipeId' is missing or has an invalid type",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  if (!(0, import_utils.isValidRecipeId)(recipeId)) {
    throw new import_error.default({
      message: "Invalid recipe id",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  if (firstName === void 0 || typeof firstName !== "string") {
    throw new import_error.default({
      message: "Required parameter 'firstName' is missing or has an invalid type",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  if (lastName === void 0 || typeof lastName !== "string") {
    throw new import_error.default({
      message: "Required parameter 'lastName' is missing or has an invalid type",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  if (email === void 0 || typeof email !== "string") {
    throw new import_error.default({
      message: "Required parameter 'email' is missing or has an invalid type",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  if (phone === void 0 || typeof phone !== "string") {
    throw new import_error.default({
      message: "Required parameter 'phone' is missing or has an invalid type",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  let userResponse = await (0, import_utils.getUserForRecipeId)(new import_recipeUserId.default(recipeUserId), recipeId, userContext);
  if (userResponse.user === void 0 || userResponse.recipe === void 0) {
    throw new Error("Should never come here");
  }
  if (firstName.trim() !== "" || lastName.trim() !== "") {
    let isRecipeInitialised = false;
    try {
      import_recipe3.default.getInstanceOrThrowError();
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
      await import_usermetadata.default.updateUserMetadata(userResponse.user.id, metaDataUpdate, userContext);
    }
  }
  if (email.trim() !== "") {
    const emailUpdateResponse = await updateEmailForRecipeId(
      userResponse.recipe,
      new import_recipeUserId.default(recipeUserId),
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
      new import_recipeUserId.default(recipeUserId),
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  userPut
});
