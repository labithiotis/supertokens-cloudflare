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
var userPasswordPut_exports = {};
__export(userPasswordPut_exports, {
  userPasswordPut: () => userPasswordPut
});
module.exports = __toCommonJS(userPasswordPut_exports);
var import_error = __toESM(require("../../../../error"), 1);
var import_emailpassword = __toESM(require("../../../emailpassword"), 1);
var import_recipeUserId = __toESM(require("../../../../recipeUserId"), 1);
const userPasswordPut = async (_, tenantId, options, userContext) => {
  const requestBody = await options.req.getJSONBody();
  const recipeUserId = requestBody.recipeUserId;
  const newPassword = requestBody.newPassword;
  if (recipeUserId === void 0 || typeof recipeUserId !== "string") {
    throw new import_error.default({
      message: "Required parameter 'recipeUserId' is missing or has an invalid type",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  if (newPassword === void 0 || typeof newPassword !== "string") {
    throw new import_error.default({
      message: "Required parameter 'newPassword' is missing or has an invalid type",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  const updateResponse = await import_emailpassword.default.updateEmailOrPassword({
    recipeUserId: new import_recipeUserId.default(recipeUserId),
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  userPasswordPut
});
