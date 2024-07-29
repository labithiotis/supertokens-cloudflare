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
var emailpasswordUser_exports = {};
__export(emailpasswordUser_exports, {
  createEmailPasswordUser: () => createEmailPasswordUser
});
module.exports = __toCommonJS(emailpasswordUser_exports);
var import_error = __toESM(require("../../../../../error"), 1);
var import_emailpassword = __toESM(require("../../../../emailpassword"), 1);
var import_recipe = __toESM(require("../../../../emailpassword/recipe"), 1);
const createEmailPasswordUser = async (_, tenantId, options, userContext) => {
  let emailPassword = void 0;
  try {
    emailPassword = import_recipe.default.getInstanceOrThrowError();
  } catch (error) {
    return {
      status: "FEATURE_NOT_ENABLED_ERROR"
    };
  }
  const requestBody = await options.req.getJSONBody();
  const email = requestBody.email;
  const password = requestBody.password;
  if (email === void 0 || typeof email !== "string") {
    throw new import_error.default({
      message: "Required parameter 'email' is missing or has an invalid type",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  if (password === void 0 || typeof password !== "string") {
    throw new import_error.default({
      message: "Required parameter 'password' is missing or has an invalid type",
      type: import_error.default.BAD_INPUT_ERROR
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
  const response = await import_emailpassword.default.signUp(tenantId, email, password);
  if (response.status === "OK" || response.status === "EMAIL_ALREADY_EXISTS_ERROR") {
    return response;
  } else {
    throw new Error(
      "This should never happen: EmailPassword.signUp threw a session user related error without passing a session"
    );
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createEmailPasswordUser
});
