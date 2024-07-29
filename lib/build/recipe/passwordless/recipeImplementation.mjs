var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
import AccountLinking from "../accountlinking/recipe";
import EmailVerification from "../emailverification/recipe";
import NormalisedURLPath from "../../normalisedURLPath";
import { logDebugMessage } from "../../logger";
import { User } from "../../user";
import { getUser } from "../..";
import RecipeUserId from "../../recipeUserId";
import { AuthUtils } from "../../authUtils";
function getRecipeInterface(querier) {
  function copyAndRemoveUserContextAndTenantId(input) {
    let result = __spreadValues({}, input);
    delete result.userContext;
    delete result.tenantId;
    delete result.session;
    if (result.recipeUserId !== void 0 && result.recipeUserId.getAsString !== void 0) {
      result.recipeUserId = result.recipeUserId.getAsString();
    }
    return result;
  }
  return {
    consumeCode: async function(input) {
      const response = await querier.sendPostRequest(
        new NormalisedURLPath(`/${input.tenantId}/recipe/signinup/code/consume`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      if (response.status !== "OK") {
        return response;
      }
      logDebugMessage("Passwordless.consumeCode code consumed OK");
      response.user = new User(response.user);
      response.recipeUserId = new RecipeUserId(response.recipeUserId);
      if (response.status !== "OK") {
        return response;
      }
      if (response.status !== "OK") {
        return response;
      }
      let updatedUser = response.user;
      const linkResult = await AuthUtils.linkToSessionIfProvidedElseCreatePrimaryUserIdOrLinkByAccountInfo({
        tenantId: input.tenantId,
        inputUser: response.user,
        recipeUserId: response.recipeUserId,
        session: input.session,
        userContext: input.userContext
      });
      if (linkResult.status !== "OK") {
        return linkResult;
      }
      updatedUser = linkResult.user;
      if (updatedUser === void 0) {
        throw new Error("Should never come here.");
      }
      response.user = updatedUser;
      return __spreadProps(__spreadValues({}, response), {
        consumedDevice: response.consumedDevice,
        createdNewRecipeUser: response.createdNewUser,
        user: response.user,
        recipeUserId: response.recipeUserId
      });
    },
    checkCode: async function(input) {
      let response = await querier.sendPostRequest(
        new NormalisedURLPath(`/${input.tenantId}/recipe/signinup/code/check`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      if (response.status !== "OK") {
        return response;
      }
      logDebugMessage("Passwordless.checkCode code verified");
      return response;
    },
    createCode: async function(input) {
      let response = await querier.sendPostRequest(
        new NormalisedURLPath(`/${input.tenantId}/recipe/signinup/code`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      return response;
    },
    createNewCodeForDevice: async function(input) {
      let response = await querier.sendPostRequest(
        new NormalisedURLPath(`/${input.tenantId}/recipe/signinup/code`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      return response;
    },
    listCodesByDeviceId: async function(input) {
      let response = await querier.sendGetRequest(
        new NormalisedURLPath(`/${input.tenantId}/recipe/signinup/codes`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      return response.devices.length === 1 ? response.devices[0] : void 0;
    },
    listCodesByEmail: async function(input) {
      let response = await querier.sendGetRequest(
        new NormalisedURLPath(`/${input.tenantId}/recipe/signinup/codes`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      return response.devices;
    },
    listCodesByPhoneNumber: async function(input) {
      let response = await querier.sendGetRequest(
        new NormalisedURLPath(`/${input.tenantId}/recipe/signinup/codes`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      return response.devices;
    },
    listCodesByPreAuthSessionId: async function(input) {
      let response = await querier.sendGetRequest(
        new NormalisedURLPath(`/${input.tenantId}/recipe/signinup/codes`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      return response.devices.length === 1 ? response.devices[0] : void 0;
    },
    revokeAllCodes: async function(input) {
      await querier.sendPostRequest(
        new NormalisedURLPath(`/${input.tenantId}/recipe/signinup/codes/remove`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      return {
        status: "OK"
      };
    },
    revokeCode: async function(input) {
      await querier.sendPostRequest(
        new NormalisedURLPath(`/${input.tenantId}/recipe/signinup/code/remove`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      return { status: "OK" };
    },
    updateUser: async function(input) {
      const accountLinking = AccountLinking.getInstance();
      if (input.email) {
        const user2 = await getUser(input.recipeUserId.getAsString(), input.userContext);
        if (user2 === void 0) {
          return { status: "UNKNOWN_USER_ID_ERROR" };
        }
        const evInstance = EmailVerification.getInstance();
        let isEmailVerified = false;
        if (evInstance) {
          isEmailVerified = await evInstance.recipeInterfaceImpl.isEmailVerified({
            recipeUserId: input.recipeUserId,
            email: input.email,
            userContext: input.userContext
          });
        }
        const isEmailChangeAllowed = await accountLinking.isEmailChangeAllowed({
          user: user2,
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
      let response = await querier.sendPutRequest(
        new NormalisedURLPath(`/recipe/user`),
        copyAndRemoveUserContextAndTenantId(input),
        input.userContext
      );
      if (response.status !== "OK") {
        return response;
      }
      const user = await getUser(input.recipeUserId.getAsString(), input.userContext);
      if (user === void 0) {
        return {
          status: "UNKNOWN_USER_ID_ERROR"
        };
      }
      await AccountLinking.getInstance().verifyEmailForRecipeUserIfLinkedAccountsAreVerified({
        user,
        recipeUserId: input.recipeUserId,
        userContext: input.userContext
      });
      return response;
    }
  };
}
export {
  getRecipeInterface as default
};
