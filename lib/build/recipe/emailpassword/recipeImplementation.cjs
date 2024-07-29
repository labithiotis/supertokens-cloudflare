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
var import_recipe = __toESM(require("../accountlinking/recipe"), 1);
var import_recipe2 = __toESM(require("../emailverification/recipe"), 1);
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import__ = require("../..");
var import_constants = require("./constants");
var import_recipeUserId = __toESM(require("../../recipeUserId"), 1);
var import_constants2 = require("../multitenancy/constants");
var import_user = require("../../user");
var import_authUtils = require("../../authUtils");
function getRecipeInterface(querier, getEmailPasswordConfig) {
  return {
    signUp: async function({ email, password, tenantId, session, userContext }) {
      const response = await this.createNewRecipeUser({
        email,
        password,
        tenantId,
        userContext
      });
      if (response.status !== "OK") {
        return response;
      }
      let updatedUser = response.user;
      const linkResult = await import_authUtils.AuthUtils.linkToSessionIfProvidedElseCreatePrimaryUserIdOrLinkByAccountInfo({
        tenantId,
        inputUser: response.user,
        recipeUserId: response.recipeUserId,
        session,
        userContext
      });
      if (linkResult.status != "OK") {
        return linkResult;
      }
      updatedUser = linkResult.user;
      return {
        status: "OK",
        user: updatedUser,
        recipeUserId: response.recipeUserId
      };
    },
    createNewRecipeUser: async function(input) {
      const resp = await querier.sendPostRequest(
        new import_normalisedURLPath.default(
          `/${input.tenantId === void 0 ? import_constants2.DEFAULT_TENANT_ID : input.tenantId}/recipe/signup`
        ),
        {
          email: input.email,
          password: input.password
        },
        input.userContext
      );
      if (resp.status === "OK") {
        return {
          status: "OK",
          user: new import_user.User(resp.user),
          recipeUserId: new import_recipeUserId.default(resp.recipeUserId)
        };
      }
      return resp;
    },
    signIn: async function({ email, password, tenantId, session, userContext }) {
      const response = await this.verifyCredentials({ email, password, tenantId, userContext });
      if (response.status === "OK") {
        const loginMethod = response.user.loginMethods.find(
          (lm) => lm.recipeUserId.getAsString() === response.recipeUserId.getAsString()
        );
        if (!loginMethod.verified) {
          await import_recipe.default.getInstance().verifyEmailForRecipeUserIfLinkedAccountsAreVerified({
            user: response.user,
            recipeUserId: response.recipeUserId,
            userContext
          });
          response.user = await (0, import__.getUser)(response.recipeUserId.getAsString(), userContext);
        }
        const linkResult = await import_authUtils.AuthUtils.linkToSessionIfProvidedElseCreatePrimaryUserIdOrLinkByAccountInfo({
          tenantId,
          inputUser: response.user,
          recipeUserId: response.recipeUserId,
          session,
          userContext
        });
        if (linkResult.status === "LINKING_TO_SESSION_USER_FAILED") {
          return linkResult;
        }
        response.user = linkResult.user;
      }
      return response;
    },
    verifyCredentials: async function({
      email,
      password,
      tenantId,
      userContext
    }) {
      const response = await querier.sendPostRequest(
        new import_normalisedURLPath.default(`/${tenantId === void 0 ? import_constants2.DEFAULT_TENANT_ID : tenantId}/recipe/signin`),
        {
          email,
          password
        },
        userContext
      );
      if (response.status === "OK") {
        return {
          status: "OK",
          user: new import_user.User(response.user),
          recipeUserId: new import_recipeUserId.default(response.recipeUserId)
        };
      }
      return {
        status: "WRONG_CREDENTIALS_ERROR"
      };
    },
    createResetPasswordToken: async function({
      userId,
      email,
      tenantId,
      userContext
    }) {
      return await querier.sendPostRequest(
        new import_normalisedURLPath.default(
          `/${tenantId === void 0 ? import_constants2.DEFAULT_TENANT_ID : tenantId}/recipe/user/password/reset/token`
        ),
        {
          userId,
          email
        },
        userContext
      );
    },
    consumePasswordResetToken: async function({
      token,
      tenantId,
      userContext
    }) {
      return await querier.sendPostRequest(
        new import_normalisedURLPath.default(
          `/${tenantId === void 0 ? import_constants2.DEFAULT_TENANT_ID : tenantId}/recipe/user/password/reset/token/consume`
        ),
        {
          method: "token",
          token
        },
        userContext
      );
    },
    updateEmailOrPassword: async function(input) {
      const accountLinking = import_recipe.default.getInstance();
      if (input.email) {
        const user = await (0, import__.getUser)(input.recipeUserId.getAsString(), input.userContext);
        if (user === void 0) {
          return { status: "UNKNOWN_USER_ID_ERROR" };
        }
        const evInstance = import_recipe2.default.getInstance();
        let isEmailVerified = false;
        if (evInstance) {
          isEmailVerified = await evInstance.recipeInterfaceImpl.isEmailVerified({
            recipeUserId: input.recipeUserId,
            email: input.email,
            userContext: input.userContext
          });
        }
        const isEmailChangeAllowed = await accountLinking.isEmailChangeAllowed({
          user,
          isVerified: isEmailVerified,
          newEmail: input.email,
          session: void 0,
          userContext: input.userContext
        });
        if (!isEmailChangeAllowed.allowed) {
          return {
            status: "EMAIL_CHANGE_NOT_ALLOWED_ERROR",
            reason: isEmailChangeAllowed.reason === "ACCOUNT_TAKEOVER_RISK" ? "New email cannot be applied to existing account because of account takeover risks." : "New email cannot be applied to existing account because of there is another primary user with the same email address."
          };
        }
      }
      if (input.applyPasswordPolicy || input.applyPasswordPolicy === void 0) {
        let formFields = getEmailPasswordConfig().signUpFeature.formFields;
        if (input.password !== void 0) {
          const passwordField = formFields.filter((el) => el.id === import_constants.FORM_FIELD_PASSWORD_ID)[0];
          const error = await passwordField.validate(
            input.password,
            input.tenantIdForPasswordPolicy,
            input.userContext
          );
          if (error !== void 0) {
            return {
              status: "PASSWORD_POLICY_VIOLATED_ERROR",
              failureReason: error
            };
          }
        }
      }
      let response = await querier.sendPutRequest(
        new import_normalisedURLPath.default(`/recipe/user`),
        {
          recipeUserId: input.recipeUserId.getAsString(),
          email: input.email,
          password: input.password
        },
        input.userContext
      );
      if (response.status === "OK") {
        const user = await (0, import__.getUser)(input.recipeUserId.getAsString(), input.userContext);
        if (user === void 0) {
          return {
            status: "UNKNOWN_USER_ID_ERROR"
          };
        }
        await import_recipe.default.getInstance().verifyEmailForRecipeUserIfLinkedAccountsAreVerified({
          user,
          recipeUserId: input.recipeUserId,
          userContext: input.userContext
        });
      }
      return response;
    }
  };
}
