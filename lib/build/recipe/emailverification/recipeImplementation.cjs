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
var recipeImplementation_exports = {};
__export(recipeImplementation_exports, {
  default: () => getRecipeInterface
});
module.exports = __toCommonJS(recipeImplementation_exports);
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import_recipeUserId = __toESM(require("../../recipeUserId"), 1);
var import__ = require("../..");
var import_recipe = __toESM(require("../accountlinking/recipe"), 1);
function getRecipeInterface(querier, getEmailForRecipeUserId) {
  return {
    createEmailVerificationToken: async function({
      recipeUserId,
      email,
      tenantId,
      userContext
    }) {
      let response = await querier.sendPostRequest(
        new import_normalisedURLPath.default(`/${tenantId}/recipe/user/email/verify/token`),
        {
          userId: recipeUserId.getAsString(),
          email
        },
        userContext
      );
      if (response.status === "OK") {
        return {
          status: "OK",
          token: response.token
        };
      } else {
        return {
          status: "EMAIL_ALREADY_VERIFIED_ERROR"
        };
      }
    },
    verifyEmailUsingToken: async function({
      token,
      attemptAccountLinking,
      tenantId,
      userContext
    }) {
      let response = await querier.sendPostRequest(
        new import_normalisedURLPath.default(`/${tenantId}/recipe/user/email/verify`),
        {
          method: "token",
          token
        },
        userContext
      );
      if (response.status === "OK") {
        const recipeUserId = new import_recipeUserId.default(response.userId);
        if (attemptAccountLinking) {
          const updatedUser = await (0, import__.getUser)(recipeUserId.getAsString());
          if (updatedUser) {
            let emailInfo = await getEmailForRecipeUserId(updatedUser, recipeUserId, userContext);
            if (emailInfo.status === "OK" && emailInfo.email === response.email) {
              const AccountLinking = import_recipe.default.getInstance();
              await AccountLinking.tryLinkingByAccountInfoOrCreatePrimaryUser({
                tenantId,
                inputUser: updatedUser,
                session: void 0,
                userContext
              });
            }
          }
        }
        return {
          status: "OK",
          user: {
            recipeUserId,
            email: response.email
          }
        };
      } else {
        return {
          status: "EMAIL_VERIFICATION_INVALID_TOKEN_ERROR"
        };
      }
    },
    isEmailVerified: async function({
      recipeUserId,
      email,
      userContext
    }) {
      let response = await querier.sendGetRequest(
        new import_normalisedURLPath.default("/recipe/user/email/verify"),
        {
          userId: recipeUserId.getAsString(),
          email
        },
        userContext
      );
      return response.isVerified;
    },
    revokeEmailVerificationTokens: async function(input) {
      await querier.sendPostRequest(
        new import_normalisedURLPath.default(`/${input.tenantId}/recipe/user/email/verify/token/remove`),
        {
          userId: input.recipeUserId.getAsString(),
          email: input.email
        },
        input.userContext
      );
      return { status: "OK" };
    },
    unverifyEmail: async function(input) {
      await querier.sendPostRequest(
        new import_normalisedURLPath.default("/recipe/user/email/verify/remove"),
        {
          userId: input.recipeUserId.getAsString(),
          email: input.email
        },
        input.userContext
      );
      return { status: "OK" };
    }
  };
}
