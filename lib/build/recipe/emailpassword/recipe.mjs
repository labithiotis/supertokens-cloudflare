import RecipeModule from "../../recipeModule";
import STError from "./error";
import { validateAndNormaliseUserInput } from "./utils";
import NormalisedURLPath from "../../normalisedURLPath";
import {
  SIGN_UP_API,
  SIGN_IN_API,
  GENERATE_PASSWORD_RESET_TOKEN_API,
  PASSWORD_RESET_API,
  SIGNUP_EMAIL_EXISTS_API,
  SIGNUP_EMAIL_EXISTS_API_OLD
} from "./constants";
import signUpAPI from "./api/signup";
import signInAPI from "./api/signin";
import generatePasswordResetTokenAPI from "./api/generatePasswordResetToken";
import passwordResetAPI from "./api/passwordReset";
import { send200Response } from "../../utils";
import emailExistsAPI from "./api/emailExists";
import RecipeImplementation from "./recipeImplementation";
import APIImplementation from "./api/implementation";
import { Querier } from "../../querier";
import OverrideableBuilder from "supertokens-js-override";
import EmailDeliveryIngredient from "../../ingredients/emaildelivery";
import { PostSuperTokensInitCallbacks } from "../../postSuperTokensInitCallbacks";
import MultiFactorAuthRecipe from "../multifactorauth/recipe";
import MultitenancyRecipe from "../multitenancy/recipe";
import { isFakeEmail } from "../thirdparty/utils";
import { FactorIds } from "../multifactorauth";
import { env } from "node:process";
const _Recipe = class _Recipe extends RecipeModule {
  constructor(recipeId, appInfo, isInServerlessEnv, config, ingredients) {
    super(recipeId, appInfo);
    // abstract instance functions below...............
    this.getAPIsHandled = () => {
      return [
        {
          method: "post",
          pathWithoutApiBasePath: new NormalisedURLPath(SIGN_UP_API),
          id: SIGN_UP_API,
          disabled: this.apiImpl.signUpPOST === void 0
        },
        {
          method: "post",
          pathWithoutApiBasePath: new NormalisedURLPath(SIGN_IN_API),
          id: SIGN_IN_API,
          disabled: this.apiImpl.signInPOST === void 0
        },
        {
          method: "post",
          pathWithoutApiBasePath: new NormalisedURLPath(GENERATE_PASSWORD_RESET_TOKEN_API),
          id: GENERATE_PASSWORD_RESET_TOKEN_API,
          disabled: this.apiImpl.generatePasswordResetTokenPOST === void 0
        },
        {
          method: "post",
          pathWithoutApiBasePath: new NormalisedURLPath(PASSWORD_RESET_API),
          id: PASSWORD_RESET_API,
          disabled: this.apiImpl.passwordResetPOST === void 0
        },
        {
          method: "get",
          pathWithoutApiBasePath: new NormalisedURLPath(SIGNUP_EMAIL_EXISTS_API),
          id: SIGNUP_EMAIL_EXISTS_API,
          disabled: this.apiImpl.emailExistsGET === void 0
        },
        {
          method: "get",
          pathWithoutApiBasePath: new NormalisedURLPath(SIGNUP_EMAIL_EXISTS_API_OLD),
          id: SIGNUP_EMAIL_EXISTS_API_OLD,
          disabled: this.apiImpl.emailExistsGET === void 0
        }
      ];
    };
    this.handleAPIRequest = async (id, tenantId, req, res, _path, _method, userContext) => {
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
      if (id === SIGN_UP_API) {
        return await signUpAPI(this.apiImpl, tenantId, options, userContext);
      } else if (id === SIGN_IN_API) {
        return await signInAPI(this.apiImpl, tenantId, options, userContext);
      } else if (id === GENERATE_PASSWORD_RESET_TOKEN_API) {
        return await generatePasswordResetTokenAPI(this.apiImpl, tenantId, options, userContext);
      } else if (id === PASSWORD_RESET_API) {
        return await passwordResetAPI(this.apiImpl, tenantId, options, userContext);
      } else if (id === SIGNUP_EMAIL_EXISTS_API || id === SIGNUP_EMAIL_EXISTS_API_OLD) {
        return await emailExistsAPI(this.apiImpl, tenantId, options, userContext);
      }
      return false;
    };
    this.handleError = async (err, _request, response) => {
      if (err.fromRecipe === _Recipe.RECIPE_ID) {
        if (err.type === STError.FIELD_ERROR) {
          return send200Response(response, {
            status: "FIELD_ERROR",
            formFields: err.payload
          });
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    };
    this.getAllCORSHeaders = () => {
      return [];
    };
    this.isErrorFromThisRecipe = (err) => {
      return STError.isErrorFromSuperTokens(err) && err.fromRecipe === _Recipe.RECIPE_ID;
    };
    this.isInServerlessEnv = isInServerlessEnv;
    this.config = validateAndNormaliseUserInput(this, appInfo, config);
    {
      const getEmailPasswordConfig = () => this.config;
      let builder = new OverrideableBuilder(
        RecipeImplementation(Querier.getNewInstanceOrThrowError(recipeId), getEmailPasswordConfig)
      );
      this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
    }
    {
      let builder = new OverrideableBuilder(APIImplementation());
      this.apiImpl = builder.override(this.config.override.apis).build();
    }
    this.emailDelivery = ingredients.emailDelivery === void 0 ? new EmailDeliveryIngredient(this.config.getEmailDeliveryConfig(this.isInServerlessEnv)) : ingredients.emailDelivery;
    PostSuperTokensInitCallbacks.addPostInitCallback(() => {
      const mfaInstance = MultiFactorAuthRecipe.getInstance();
      if (mfaInstance !== void 0) {
        mfaInstance.addFuncToGetAllAvailableSecondaryFactorIdsFromOtherRecipes(() => {
          return ["emailpassword"];
        });
        mfaInstance.addFuncToGetFactorsSetupForUserFromOtherRecipes(async (user) => {
          for (const loginMethod of user.loginMethods) {
            if (loginMethod.recipeId === _Recipe.RECIPE_ID) {
              return ["emailpassword"];
            }
          }
          return [];
        });
        mfaInstance.addFuncToGetEmailsForFactorFromOtherRecipes((user, sessionRecipeUserId) => {
          let sessionLoginMethod = user.loginMethods.find((lM) => {
            return lM.recipeUserId.getAsString() === sessionRecipeUserId.getAsString();
          });
          if (sessionLoginMethod === void 0) {
            return {
              status: "UNKNOWN_SESSION_RECIPE_USER_ID"
            };
          }
          const orderedLoginMethodsByTimeJoinedOldestFirst = user.loginMethods.sort((a, b) => {
            return a.timeJoined - b.timeJoined;
          });
          const recipeLoginMethodsOrderedByTimeJoinedOldestFirst = orderedLoginMethodsByTimeJoinedOldestFirst.filter(
            (lm) => lm.recipeId === _Recipe.RECIPE_ID
          );
          let result;
          if (recipeLoginMethodsOrderedByTimeJoinedOldestFirst.length !== 0) {
            result = [
              // First we take the verified real emails associated with emailpassword login methods ordered by timeJoined (oldest first)
              ...recipeLoginMethodsOrderedByTimeJoinedOldestFirst.filter((lm) => !isFakeEmail(lm.email) && lm.verified === true).map((lm) => lm.email),
              // Then we take the non-verified real emails associated with emailpassword login methods ordered by timeJoined (oldest first)
              ...recipeLoginMethodsOrderedByTimeJoinedOldestFirst.filter((lm) => !isFakeEmail(lm.email) && lm.verified === false).map((lm) => lm.email),
              // Lastly, fake emails associated with emailpassword login methods ordered by timeJoined (oldest first)
              // We also add these into the list because they already have a password added to them so they can be a valid choice when signing in
              // We do not want to remove the previously added "MFA password", because a new email password user was linked
              // E.g.:
              // 1. A discord user adds a password for MFA (which will use the fake email associated with the discord user)
              // 2. Later they also sign up and (manually) link a full emailpassword user that they intend to use as a first factor
              // 3. The next time they sign in using Discord, they could be asked for a secondary password.
              // In this case, they'd be checked against the first user that they originally created for MFA, not the one later linked to the account
              ...recipeLoginMethodsOrderedByTimeJoinedOldestFirst.filter((lm) => isFakeEmail(lm.email)).map((lm) => lm.email)
            ];
          } else {
            if (orderedLoginMethodsByTimeJoinedOldestFirst.some(
              (lm) => lm.email !== void 0 && !isFakeEmail(lm.email)
            )) {
              result = orderedLoginMethodsByTimeJoinedOldestFirst.filter((lm) => lm.email !== void 0 && !isFakeEmail(lm.email)).map((lm) => lm.email);
            } else {
              result = orderedLoginMethodsByTimeJoinedOldestFirst.filter((lm) => lm.email !== void 0 && isFakeEmail(lm.email)).map((lm) => lm.email);
            }
            result = Array.from(new Set(result));
          }
          if (sessionLoginMethod.email !== void 0 && result.includes(sessionLoginMethod.email)) {
            result = [
              sessionLoginMethod.email,
              ...result.filter((email) => email !== sessionLoginMethod.email)
            ];
          }
          if (result.length === 0) {
            result.push(`${sessionRecipeUserId.getAsString()}@stfakeemail.supertokens.com`);
          }
          return {
            status: "OK",
            factorIdToEmailsMap: {
              emailpassword: result
            }
          };
        });
      }
      const mtRecipe = MultitenancyRecipe.getInstance();
      if (mtRecipe !== void 0) {
        mtRecipe.allAvailableFirstFactors.push(FactorIds.EMAILPASSWORD);
      }
    });
  }
  static getInstanceOrThrowError() {
    if (_Recipe.instance !== void 0) {
      return _Recipe.instance;
    }
    throw new Error("Initialisation not done. Did you forget to call the Emailpassword.init function?");
  }
  static init(config) {
    return (appInfo, isInServerlessEnv) => {
      if (_Recipe.instance === void 0) {
        _Recipe.instance = new _Recipe(_Recipe.RECIPE_ID, appInfo, isInServerlessEnv, config, {
          emailDelivery: void 0
        });
        return _Recipe.instance;
      } else {
        throw new Error("Emailpassword recipe has already been initialised. Please check your code for bugs.");
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
_Recipe.RECIPE_ID = "emailpassword";
let Recipe = _Recipe;
export {
  Recipe as default
};
