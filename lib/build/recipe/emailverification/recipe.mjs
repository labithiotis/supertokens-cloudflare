import RecipeModule from "../../recipeModule";
import STError from "./error";
import { validateAndNormaliseUserInput } from "./utils";
import NormalisedURLPath from "../../normalisedURLPath";
import { GENERATE_EMAIL_VERIFY_TOKEN_API, EMAIL_VERIFY_API } from "./constants";
import generateEmailVerifyTokenAPI from "./api/generateEmailVerifyToken";
import emailVerifyAPI from "./api/emailVerify";
import RecipeImplementation from "./recipeImplementation";
import APIImplementation from "./api/implementation";
import { Querier } from "../../querier";
import OverrideableBuilder from "supertokens-js-override";
import EmailDeliveryIngredient from "../../ingredients/emaildelivery";
import { PostSuperTokensInitCallbacks } from "../../postSuperTokensInitCallbacks";
import SessionRecipe from "../session/recipe";
import { EmailVerificationClaim } from "./emailVerificationClaim";
import SessionError from "../session/error";
import Session from "../session";
import { getUser } from "../..";
import { logDebugMessage } from "../../logger";
import { env } from "node:process";
const _Recipe = class _Recipe extends RecipeModule {
  constructor(recipeId, appInfo, isInServerlessEnv, config, ingredients) {
    super(recipeId, appInfo);
    // abstract instance functions below...............
    this.getAPIsHandled = () => {
      return [
        {
          method: "post",
          pathWithoutApiBasePath: new NormalisedURLPath(GENERATE_EMAIL_VERIFY_TOKEN_API),
          id: GENERATE_EMAIL_VERIFY_TOKEN_API,
          disabled: this.apiImpl.generateEmailVerifyTokenPOST === void 0
        },
        {
          method: "post",
          pathWithoutApiBasePath: new NormalisedURLPath(EMAIL_VERIFY_API),
          id: EMAIL_VERIFY_API,
          disabled: this.apiImpl.verifyEmailPOST === void 0
        },
        {
          method: "get",
          pathWithoutApiBasePath: new NormalisedURLPath(EMAIL_VERIFY_API),
          id: EMAIL_VERIFY_API,
          disabled: this.apiImpl.isEmailVerifiedGET === void 0
        }
      ];
    };
    this.handleAPIRequest = async (id, tenantId, req, res, _, __, userContext) => {
      let options = {
        config: this.config,
        recipeId: this.getRecipeId(),
        isInServerlessEnv: this.isInServerlessEnv,
        recipeImplementation: this.recipeInterfaceImpl,
        req,
        res,
        emailDelivery: this.emailDelivery,
        appInfo: this.getAppInfo()
      };
      if (id === GENERATE_EMAIL_VERIFY_TOKEN_API) {
        return await generateEmailVerifyTokenAPI(this.apiImpl, options, userContext);
      } else {
        return await emailVerifyAPI(this.apiImpl, tenantId, options, userContext);
      }
    };
    this.handleError = async (err, _, __) => {
      throw err;
    };
    this.getAllCORSHeaders = () => {
      return [];
    };
    this.isErrorFromThisRecipe = (err) => {
      return STError.isErrorFromSuperTokens(err) && err.fromRecipe === _Recipe.RECIPE_ID;
    };
    this.getEmailForRecipeUserId = async (user, recipeUserId, userContext) => {
      if (this.config.getEmailForRecipeUserId !== void 0) {
        const userRes = await this.config.getEmailForRecipeUserId(recipeUserId, userContext);
        if (userRes.status !== "UNKNOWN_USER_ID_ERROR") {
          return userRes;
        }
      }
      if (user === void 0) {
        user = await getUser(recipeUserId.getAsString(), userContext);
        if (user === void 0) {
          return {
            status: "UNKNOWN_USER_ID_ERROR"
          };
        }
      }
      for (let i = 0; i < user.loginMethods.length; i++) {
        let currLM = user.loginMethods[i];
        if (currLM.recipeUserId.getAsString() === recipeUserId.getAsString()) {
          if (currLM.email !== void 0) {
            return {
              email: currLM.email,
              status: "OK"
            };
          } else {
            return {
              status: "EMAIL_DOES_NOT_EXIST_ERROR"
            };
          }
        }
      }
      return {
        status: "UNKNOWN_USER_ID_ERROR"
      };
    };
    this.getPrimaryUserIdForRecipeUser = async (recipeUserId, userContext) => {
      let primaryUser = await getUser(recipeUserId.getAsString(), userContext);
      if (primaryUser === void 0) {
        return recipeUserId.getAsString();
      }
      return primaryUser == null ? void 0 : primaryUser.id;
    };
    this.updateSessionIfRequiredPostEmailVerification = async (input) => {
      let primaryUserId = await this.getPrimaryUserIdForRecipeUser(
        input.recipeUserIdWhoseEmailGotVerified,
        input.userContext
      );
      if (input.session !== void 0) {
        logDebugMessage("updateSessionIfRequiredPostEmailVerification got session");
        if (input.session.getRecipeUserId(input.userContext).getAsString() === input.recipeUserIdWhoseEmailGotVerified.getAsString()) {
          logDebugMessage(
            "updateSessionIfRequiredPostEmailVerification the session belongs to the verified user"
          );
          if (input.session.getUserId() === primaryUserId) {
            logDebugMessage(
              "updateSessionIfRequiredPostEmailVerification the session userId matches the primary user id, so we are only refreshing the claim"
            );
            try {
              await input.session.fetchAndSetClaim(EmailVerificationClaim, input.userContext);
            } catch (err) {
              if (err.message === "UNKNOWN_USER_ID") {
                throw new SessionError({
                  type: SessionError.UNAUTHORISED,
                  message: "Unknown User ID provided"
                });
              }
              throw err;
            }
            return;
          } else {
            logDebugMessage(
              "updateSessionIfRequiredPostEmailVerification the session user id doesn't match the primary user id, so we are revoking all sessions and creating a new one"
            );
            await Session.revokeAllSessionsForUser(
              input.recipeUserIdWhoseEmailGotVerified.getAsString(),
              false,
              input.session.getTenantId(),
              input.userContext
            );
            return await Session.createNewSession(
              input.req,
              input.res,
              input.session.getTenantId(),
              input.session.getRecipeUserId(input.userContext),
              {},
              {},
              input.userContext
            );
          }
        } else {
          logDebugMessage(
            "updateSessionIfRequiredPostEmailVerification the verified user doesn't match the session"
          );
          return void 0;
        }
      } else {
        logDebugMessage("updateSessionIfRequiredPostEmailVerification got no session");
        return void 0;
      }
    };
    this.config = validateAndNormaliseUserInput(this, appInfo, config);
    this.isInServerlessEnv = isInServerlessEnv;
    {
      let builder = new OverrideableBuilder(
        RecipeImplementation(Querier.getNewInstanceOrThrowError(recipeId), this.getEmailForRecipeUserId)
      );
      this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
    }
    {
      let builder = new OverrideableBuilder(APIImplementation());
      this.apiImpl = builder.override(this.config.override.apis).build();
    }
    this.emailDelivery = ingredients.emailDelivery === void 0 ? new EmailDeliveryIngredient(this.config.getEmailDeliveryConfig(this.isInServerlessEnv)) : ingredients.emailDelivery;
  }
  static getInstanceOrThrowError() {
    if (_Recipe.instance !== void 0) {
      return _Recipe.instance;
    }
    throw new Error("Initialisation not done. Did you forget to call the EmailVerification.init function?");
  }
  static getInstance() {
    return _Recipe.instance;
  }
  static init(config) {
    return (appInfo, isInServerlessEnv) => {
      if (_Recipe.instance === void 0) {
        _Recipe.instance = new _Recipe(_Recipe.RECIPE_ID, appInfo, isInServerlessEnv, config, {
          emailDelivery: void 0
        });
        PostSuperTokensInitCallbacks.addPostInitCallback(() => {
          SessionRecipe.getInstanceOrThrowError().addClaimFromOtherRecipe(EmailVerificationClaim);
          if (config.mode === "REQUIRED") {
            SessionRecipe.getInstanceOrThrowError().addClaimValidatorFromOtherRecipe(
              EmailVerificationClaim.validators.isVerified()
            );
          }
        });
        return _Recipe.instance;
      } else {
        throw new Error(
          "Emailverification recipe has already been initialised. Please check your code for bugs."
        );
      }
    };
  }
  static reset() {
    if (env.TEST_MODE !== "testing") {
      throw new Error("calling testing function in non testing env");
    }
    _Recipe.instance = void 0;
  }
};
_Recipe.instance = void 0;
_Recipe.RECIPE_ID = "emailverification";
let Recipe = _Recipe;
export {
  Recipe as default
};
