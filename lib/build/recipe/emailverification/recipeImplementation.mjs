import NormalisedURLPath from "../../normalisedURLPath";
import RecipeUserId from "../../recipeUserId";
import { getUser } from "../..";
import AccountLinkingRecipe from "../accountlinking/recipe";
function getRecipeInterface(querier, getEmailForRecipeUserId) {
  return {
    createEmailVerificationToken: async function({
      recipeUserId,
      email,
      tenantId,
      userContext
    }) {
      let response = await querier.sendPostRequest(
        new NormalisedURLPath(`/${tenantId}/recipe/user/email/verify/token`),
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
        new NormalisedURLPath(`/${tenantId}/recipe/user/email/verify`),
        {
          method: "token",
          token
        },
        userContext
      );
      if (response.status === "OK") {
        const recipeUserId = new RecipeUserId(response.userId);
        if (attemptAccountLinking) {
          const updatedUser = await getUser(recipeUserId.getAsString());
          if (updatedUser) {
            let emailInfo = await getEmailForRecipeUserId(updatedUser, recipeUserId, userContext);
            if (emailInfo.status === "OK" && emailInfo.email === response.email) {
              const AccountLinking = AccountLinkingRecipe.getInstance();
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
        new NormalisedURLPath("/recipe/user/email/verify"),
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
        new NormalisedURLPath(`/${input.tenantId}/recipe/user/email/verify/token/remove`),
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
        new NormalisedURLPath("/recipe/user/email/verify/remove"),
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
export {
  getRecipeInterface as default
};
