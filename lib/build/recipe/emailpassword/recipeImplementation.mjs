import AccountLinking from "../accountlinking/recipe";
import EmailVerification from "../emailverification/recipe";
import NormalisedURLPath from "../../normalisedURLPath";
import { getUser } from "../..";
import { FORM_FIELD_PASSWORD_ID } from "./constants";
import RecipeUserId from "../../recipeUserId";
import { DEFAULT_TENANT_ID } from "../multitenancy/constants";
import { User } from "../../user";
import { AuthUtils } from "../../authUtils";
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
      const linkResult = await AuthUtils.linkToSessionIfProvidedElseCreatePrimaryUserIdOrLinkByAccountInfo({
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
        new NormalisedURLPath(
          `/${input.tenantId === void 0 ? DEFAULT_TENANT_ID : input.tenantId}/recipe/signup`
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
          user: new User(resp.user),
          recipeUserId: new RecipeUserId(resp.recipeUserId)
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
          await AccountLinking.getInstance().verifyEmailForRecipeUserIfLinkedAccountsAreVerified({
            user: response.user,
            recipeUserId: response.recipeUserId,
            userContext
          });
          response.user = await getUser(response.recipeUserId.getAsString(), userContext);
        }
        const linkResult = await AuthUtils.linkToSessionIfProvidedElseCreatePrimaryUserIdOrLinkByAccountInfo({
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
        new NormalisedURLPath(`/${tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId}/recipe/signin`),
        {
          email,
          password
        },
        userContext
      );
      if (response.status === "OK") {
        return {
          status: "OK",
          user: new User(response.user),
          recipeUserId: new RecipeUserId(response.recipeUserId)
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
        new NormalisedURLPath(
          `/${tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId}/recipe/user/password/reset/token`
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
        new NormalisedURLPath(
          `/${tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId}/recipe/user/password/reset/token/consume`
        ),
        {
          method: "token",
          token
        },
        userContext
      );
    },
    updateEmailOrPassword: async function(input) {
      const accountLinking = AccountLinking.getInstance();
      if (input.email) {
        const user = await getUser(input.recipeUserId.getAsString(), input.userContext);
        if (user === void 0) {
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
          const passwordField = formFields.filter((el) => el.id === FORM_FIELD_PASSWORD_ID)[0];
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
        new NormalisedURLPath(`/recipe/user`),
        {
          recipeUserId: input.recipeUserId.getAsString(),
          email: input.email,
          password: input.password
        },
        input.userContext
      );
      if (response.status === "OK") {
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
      }
      return response;
    }
  };
}
export {
  getRecipeInterface as default
};
