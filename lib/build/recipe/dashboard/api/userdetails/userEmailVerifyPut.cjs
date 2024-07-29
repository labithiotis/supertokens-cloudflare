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
var userEmailVerifyPut_exports = {};
__export(userEmailVerifyPut_exports, {
  userEmailVerifyPut: () => userEmailVerifyPut
});
module.exports = __toCommonJS(userEmailVerifyPut_exports);
var import_error = __toESM(require("../../../../error"), 1);
var import_emailverification = __toESM(require("../../../emailverification"), 1);
var import_recipeUserId = __toESM(require("../../../../recipeUserId"), 1);
const userEmailVerifyPut = async (_, tenantId, options, userContext) => {
  const requestBody = await options.req.getJSONBody();
  const recipeUserId = requestBody.recipeUserId;
  const verified = requestBody.verified;
  if (recipeUserId === void 0 || typeof recipeUserId !== "string") {
    throw new import_error.default({
      message: "Required parameter 'recipeUserId' is missing or has an invalid type",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  if (verified === void 0 || typeof verified !== "boolean") {
    throw new import_error.default({
      message: "Required parameter 'verified' is missing or has an invalid type",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  if (verified) {
    const tokenResponse = await import_emailverification.default.createEmailVerificationToken(
      tenantId,
      new import_recipeUserId.default(recipeUserId),
      void 0,
      userContext
    );
    if (tokenResponse.status === "EMAIL_ALREADY_VERIFIED_ERROR") {
      return {
        status: "OK"
      };
    }
    const verifyResponse = await import_emailverification.default.verifyEmailUsingToken(
      tenantId,
      tokenResponse.token,
      void 0,
      userContext
    );
    if (verifyResponse.status === "EMAIL_VERIFICATION_INVALID_TOKEN_ERROR") {
      throw new Error("Should not come here");
    }
  } else {
    await import_emailverification.default.unverifyEmail(new import_recipeUserId.default(recipeUserId), void 0, userContext);
  }
  return {
    status: "OK"
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  userEmailVerifyPut
});
