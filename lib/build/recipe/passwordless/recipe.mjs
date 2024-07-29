import RecipeModule from "../../recipeModule";
import STError from "./error";
import { getEnabledPwlessFactors, validateAndNormaliseUserInput } from "./utils";
import NormalisedURLPath from "../../normalisedURLPath";
import RecipeImplementation from "./recipeImplementation";
import APIImplementation from "./api/implementation";
import { Querier } from "../../querier";
import OverrideableBuilder from "supertokens-js-override";
import consumeCodeAPI from "./api/consumeCode";
import createCodeAPI from "./api/createCode";
import emailExistsAPI from "./api/emailExists";
import phoneNumberExistsAPI from "./api/phoneNumberExists";
import resendCodeAPI from "./api/resendCode";
import {
  CONSUME_CODE_API,
  CREATE_CODE_API,
  DOES_EMAIL_EXIST_API,
  DOES_PHONE_NUMBER_EXIST_API,
  DOES_EMAIL_EXIST_API_OLD,
  DOES_PHONE_NUMBER_EXIST_API_OLD,
  RESEND_CODE_API
} from "./constants";
import EmailDeliveryIngredient from "../../ingredients/emaildelivery";
import SmsDeliveryIngredient from "../../ingredients/smsdelivery";
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
          id: CONSUME_CODE_API,
          disabled: this.apiImpl.consumeCodePOST === void 0,
          method: "post",
          pathWithoutApiBasePath: new NormalisedURLPath(CONSUME_CODE_API)
        },
        {
          id: CREATE_CODE_API,
          disabled: this.apiImpl.createCodePOST === void 0,
          method: "post",
          pathWithoutApiBasePath: new NormalisedURLPath(CREATE_CODE_API)
        },
        {
          id: DOES_EMAIL_EXIST_API,
          disabled: this.apiImpl.emailExistsGET === void 0,
          method: "get",
          pathWithoutApiBasePath: new NormalisedURLPath(DOES_EMAIL_EXIST_API)
        },
        {
          id: DOES_EMAIL_EXIST_API_OLD,
          disabled: this.apiImpl.emailExistsGET === void 0,
          method: "get",
          pathWithoutApiBasePath: new NormalisedURLPath(DOES_EMAIL_EXIST_API_OLD)
        },
        {
          id: DOES_PHONE_NUMBER_EXIST_API,
          disabled: this.apiImpl.phoneNumberExistsGET === void 0,
          method: "get",
          pathWithoutApiBasePath: new NormalisedURLPath(DOES_PHONE_NUMBER_EXIST_API)
        },
        {
          id: DOES_PHONE_NUMBER_EXIST_API_OLD,
          disabled: this.apiImpl.phoneNumberExistsGET === void 0,
          method: "get",
          pathWithoutApiBasePath: new NormalisedURLPath(DOES_PHONE_NUMBER_EXIST_API_OLD)
        },
        {
          id: RESEND_CODE_API,
          disabled: this.apiImpl.resendCodePOST === void 0,
          method: "post",
          pathWithoutApiBasePath: new NormalisedURLPath(RESEND_CODE_API)
        }
      ];
    };
    this.handleAPIRequest = async (id, tenantId, req, res, _, __, userContext) => {
      const options = {
        config: this.config,
        recipeId: this.getRecipeId(),
        isInServerlessEnv: this.isInServerlessEnv,
        recipeImplementation: this.recipeInterfaceImpl,
        req,
        res,
        emailDelivery: this.emailDelivery,
        smsDelivery: this.smsDelivery,
        appInfo: this.getAppInfo()
      };
      if (id === CONSUME_CODE_API) {
        return await consumeCodeAPI(this.apiImpl, tenantId, options, userContext);
      } else if (id === CREATE_CODE_API) {
        return await createCodeAPI(this.apiImpl, tenantId, options, userContext);
      } else if (id === DOES_EMAIL_EXIST_API || id === DOES_EMAIL_EXIST_API_OLD) {
        return await emailExistsAPI(this.apiImpl, tenantId, options, userContext);
      } else if (id === DOES_PHONE_NUMBER_EXIST_API || id === DOES_PHONE_NUMBER_EXIST_API_OLD) {
        return await phoneNumberExistsAPI(this.apiImpl, tenantId, options, userContext);
      } else {
        return await resendCodeAPI(this.apiImpl, tenantId, options, userContext);
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
    // helper functions below...
    this.createMagicLink = async (input) => {
      let userInputCode = this.config.getCustomUserInputCode !== void 0 ? await this.config.getCustomUserInputCode(input.tenantId, input.userContext) : void 0;
      const codeInfo = await this.recipeInterfaceImpl.createCode(
        "email" in input ? {
          email: input.email,
          userInputCode,
          session: input.session,
          tenantId: input.tenantId,
          userContext: input.userContext
        } : {
          phoneNumber: input.phoneNumber,
          userInputCode,
          session: input.session,
          tenantId: input.tenantId,
          userContext: input.userContext
        }
      );
      if (codeInfo.status !== "OK") {
        throw new Error("Failed to create user. Please retry");
      }
      const appInfo = this.getAppInfo();
      let magicLink = appInfo.getOrigin({
        request: input.request,
        userContext: input.userContext
      }).getAsStringDangerous() + appInfo.websiteBasePath.getAsStringDangerous() + "/verify?preAuthSessionId=" + codeInfo.preAuthSessionId + "&tenantId=" + input.tenantId + "#" + codeInfo.linkCode;
      return magicLink;
    };
    this.signInUp = async (input) => {
      let codeInfo = await this.recipeInterfaceImpl.createCode(
        "email" in input ? {
          email: input.email,
          tenantId: input.tenantId,
          session: input.session,
          userContext: input.userContext
        } : {
          phoneNumber: input.phoneNumber,
          tenantId: input.tenantId,
          session: input.session,
          userContext: input.userContext
        }
      );
      if (codeInfo.status !== "OK") {
        throw new Error("Failed to create user. Please retry");
      }
      let consumeCodeResponse = await this.recipeInterfaceImpl.consumeCode(
        this.config.flowType === "MAGIC_LINK" ? {
          preAuthSessionId: codeInfo.preAuthSessionId,
          linkCode: codeInfo.linkCode,
          session: input.session,
          tenantId: input.tenantId,
          userContext: input.userContext
        } : {
          preAuthSessionId: codeInfo.preAuthSessionId,
          deviceId: codeInfo.deviceId,
          userInputCode: codeInfo.userInputCode,
          session: input.session,
          tenantId: input.tenantId,
          userContext: input.userContext
        }
      );
      if (consumeCodeResponse.status === "OK") {
        return {
          status: "OK",
          createdNewRecipeUser: consumeCodeResponse.createdNewRecipeUser,
          recipeUserId: consumeCodeResponse.recipeUserId,
          user: consumeCodeResponse.user
        };
      } else {
        throw new Error("Failed to create user. Please retry");
      }
    };
    this.isInServerlessEnv = isInServerlessEnv;
    this.config = validateAndNormaliseUserInput(this, appInfo, config);
    {
      let builder = new OverrideableBuilder(RecipeImplementation(Querier.getNewInstanceOrThrowError(recipeId)));
      this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
    }
    {
      let builder = new OverrideableBuilder(APIImplementation());
      this.apiImpl = builder.override(this.config.override.apis).build();
    }
    this.emailDelivery = ingredients.emailDelivery === void 0 ? new EmailDeliveryIngredient(this.config.getEmailDeliveryConfig()) : ingredients.emailDelivery;
    this.smsDelivery = ingredients.smsDelivery === void 0 ? new SmsDeliveryIngredient(this.config.getSmsDeliveryConfig()) : ingredients.smsDelivery;
    let allFactors = getEnabledPwlessFactors(this.config);
    PostSuperTokensInitCallbacks.addPostInitCallback(() => {
      const mfaInstance = MultiFactorAuthRecipe.getInstance();
      if (mfaInstance !== void 0) {
        mfaInstance.addFuncToGetAllAvailableSecondaryFactorIdsFromOtherRecipes(() => {
          return allFactors;
        });
        mfaInstance.addFuncToGetFactorsSetupForUserFromOtherRecipes(async (user) => {
          function isFactorSetupForUser(user2, factorId) {
            for (const loginMethod of user2.loginMethods) {
              if (loginMethod.recipeId !== _Recipe.RECIPE_ID) {
                continue;
              }
              if (loginMethod.email !== void 0 && !isFakeEmail(loginMethod.email)) {
                if (factorId === FactorIds.OTP_EMAIL || factorId === FactorIds.LINK_EMAIL) {
                  return true;
                }
              }
              if (loginMethod.phoneNumber !== void 0) {
                if (factorId === FactorIds.OTP_PHONE || factorId === FactorIds.LINK_PHONE) {
                  return true;
                }
              }
            }
            return false;
          }
          return allFactors.filter((id) => isFactorSetupForUser(user, id));
        });
        mfaInstance.addFuncToGetEmailsForFactorFromOtherRecipes((user, sessionRecipeUserId) => {
          const sessionLoginMethod = user.loginMethods.find((lM) => {
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
          let nonFakeEmailsThatPasswordlessLoginMethodOrderedByTimeJoined = [];
          for (let i = 0; i < orderedLoginMethodsByTimeJoinedOldestFirst.length; i++) {
            if (orderedLoginMethodsByTimeJoinedOldestFirst[i].recipeId === _Recipe.RECIPE_ID) {
              if (orderedLoginMethodsByTimeJoinedOldestFirst[i].email !== void 0 && !isFakeEmail(orderedLoginMethodsByTimeJoinedOldestFirst[i].email)) {
                nonFakeEmailsThatPasswordlessLoginMethodOrderedByTimeJoined.push(
                  orderedLoginMethodsByTimeJoinedOldestFirst[i].email
                );
              }
            }
          }
          if (nonFakeEmailsThatPasswordlessLoginMethodOrderedByTimeJoined.length === 0) {
            let emailsResult2 = [];
            if (sessionLoginMethod.email !== void 0 && !isFakeEmail(sessionLoginMethod.email)) {
              emailsResult2 = [sessionLoginMethod.email];
            }
            for (let i = 0; i < orderedLoginMethodsByTimeJoinedOldestFirst.length; i++) {
              if (orderedLoginMethodsByTimeJoinedOldestFirst[i].email !== void 0 && !isFakeEmail(orderedLoginMethodsByTimeJoinedOldestFirst[i].email)) {
                if (!emailsResult2.includes(orderedLoginMethodsByTimeJoinedOldestFirst[i].email)) {
                  emailsResult2.push(orderedLoginMethodsByTimeJoinedOldestFirst[i].email);
                }
              }
            }
            let factorIdToEmailsMap2 = {};
            if (allFactors.includes(FactorIds.OTP_EMAIL)) {
              factorIdToEmailsMap2[FactorIds.OTP_EMAIL] = emailsResult2;
            }
            if (allFactors.includes(FactorIds.LINK_EMAIL)) {
              factorIdToEmailsMap2[FactorIds.LINK_EMAIL] = emailsResult2;
            }
            return {
              status: "OK",
              factorIdToEmailsMap: factorIdToEmailsMap2
            };
          } else if (nonFakeEmailsThatPasswordlessLoginMethodOrderedByTimeJoined.length === 1) {
            let factorIdToEmailsMap2 = {};
            if (allFactors.includes(FactorIds.OTP_EMAIL)) {
              factorIdToEmailsMap2[FactorIds.OTP_EMAIL] = nonFakeEmailsThatPasswordlessLoginMethodOrderedByTimeJoined;
            }
            if (allFactors.includes(FactorIds.LINK_EMAIL)) {
              factorIdToEmailsMap2[FactorIds.LINK_EMAIL] = nonFakeEmailsThatPasswordlessLoginMethodOrderedByTimeJoined;
            }
            return {
              status: "OK",
              factorIdToEmailsMap: factorIdToEmailsMap2
            };
          }
          let emailsResult = [];
          if (sessionLoginMethod.email !== void 0 && nonFakeEmailsThatPasswordlessLoginMethodOrderedByTimeJoined.includes(sessionLoginMethod.email)) {
            emailsResult = [sessionLoginMethod.email];
          }
          for (let i = 0; i < nonFakeEmailsThatPasswordlessLoginMethodOrderedByTimeJoined.length; i++) {
            if (!emailsResult.includes(nonFakeEmailsThatPasswordlessLoginMethodOrderedByTimeJoined[i])) {
              emailsResult.push(nonFakeEmailsThatPasswordlessLoginMethodOrderedByTimeJoined[i]);
            }
          }
          let factorIdToEmailsMap = {};
          if (allFactors.includes(FactorIds.OTP_EMAIL)) {
            factorIdToEmailsMap[FactorIds.OTP_EMAIL] = emailsResult;
          }
          if (allFactors.includes(FactorIds.LINK_EMAIL)) {
            factorIdToEmailsMap[FactorIds.LINK_EMAIL] = emailsResult;
          }
          return {
            status: "OK",
            factorIdToEmailsMap
          };
        });
        mfaInstance.addFuncToGetPhoneNumbersForFactorsFromOtherRecipes((user, sessionRecipeUserId) => {
          const sessionLoginMethod = user.loginMethods.find((lM) => {
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
          let phoneNumbersThatPasswordlessLoginMethodOrderedByTimeJoined = [];
          for (let i = 0; i < orderedLoginMethodsByTimeJoinedOldestFirst.length; i++) {
            if (orderedLoginMethodsByTimeJoinedOldestFirst[i].recipeId === _Recipe.RECIPE_ID) {
              if (orderedLoginMethodsByTimeJoinedOldestFirst[i].phoneNumber !== void 0) {
                phoneNumbersThatPasswordlessLoginMethodOrderedByTimeJoined.push(
                  orderedLoginMethodsByTimeJoinedOldestFirst[i].phoneNumber
                );
              }
            }
          }
          if (phoneNumbersThatPasswordlessLoginMethodOrderedByTimeJoined.length === 0) {
            let phonesResult2 = [];
            if (sessionLoginMethod.phoneNumber !== void 0) {
              phonesResult2 = [sessionLoginMethod.phoneNumber];
            }
            for (let i = 0; i < orderedLoginMethodsByTimeJoinedOldestFirst.length; i++) {
              if (orderedLoginMethodsByTimeJoinedOldestFirst[i].phoneNumber !== void 0) {
                if (!phonesResult2.includes(orderedLoginMethodsByTimeJoinedOldestFirst[i].phoneNumber)) {
                  phonesResult2.push(orderedLoginMethodsByTimeJoinedOldestFirst[i].phoneNumber);
                }
              }
            }
            let factorIdToPhoneNumberMap2 = {};
            if (allFactors.includes(FactorIds.OTP_PHONE)) {
              factorIdToPhoneNumberMap2[FactorIds.OTP_PHONE] = phonesResult2;
            }
            if (allFactors.includes(FactorIds.LINK_PHONE)) {
              factorIdToPhoneNumberMap2[FactorIds.LINK_PHONE] = phonesResult2;
            }
            return {
              status: "OK",
              factorIdToPhoneNumberMap: factorIdToPhoneNumberMap2
            };
          } else if (phoneNumbersThatPasswordlessLoginMethodOrderedByTimeJoined.length === 1) {
            let factorIdToPhoneNumberMap2 = {};
            if (allFactors.includes(FactorIds.OTP_PHONE)) {
              factorIdToPhoneNumberMap2[FactorIds.OTP_PHONE] = phoneNumbersThatPasswordlessLoginMethodOrderedByTimeJoined;
            }
            if (allFactors.includes(FactorIds.LINK_PHONE)) {
              factorIdToPhoneNumberMap2[FactorIds.LINK_PHONE] = phoneNumbersThatPasswordlessLoginMethodOrderedByTimeJoined;
            }
            return {
              status: "OK",
              factorIdToPhoneNumberMap: factorIdToPhoneNumberMap2
            };
          }
          let phonesResult = [];
          if (sessionLoginMethod.phoneNumber !== void 0 && phoneNumbersThatPasswordlessLoginMethodOrderedByTimeJoined.includes(
            sessionLoginMethod.phoneNumber
          )) {
            phonesResult = [sessionLoginMethod.phoneNumber];
          }
          for (let i = 0; i < phoneNumbersThatPasswordlessLoginMethodOrderedByTimeJoined.length; i++) {
            if (!phonesResult.includes(phoneNumbersThatPasswordlessLoginMethodOrderedByTimeJoined[i])) {
              phonesResult.push(phoneNumbersThatPasswordlessLoginMethodOrderedByTimeJoined[i]);
            }
          }
          let factorIdToPhoneNumberMap = {};
          if (allFactors.includes(FactorIds.OTP_PHONE)) {
            factorIdToPhoneNumberMap[FactorIds.OTP_PHONE] = phonesResult;
          }
          if (allFactors.includes(FactorIds.LINK_PHONE)) {
            factorIdToPhoneNumberMap[FactorIds.LINK_PHONE] = phonesResult;
          }
          return {
            status: "OK",
            factorIdToPhoneNumberMap
          };
        });
      }
      const mtRecipe = MultitenancyRecipe.getInstance();
      if (mtRecipe !== void 0) {
        for (const factorId of allFactors) {
          mtRecipe.allAvailableFirstFactors.push(factorId);
        }
      }
    });
  }
  static getInstanceOrThrowError() {
    if (_Recipe.instance !== void 0) {
      return _Recipe.instance;
    }
    throw new Error("Initialisation not done. Did you forget to call the Passwordless.init function?");
  }
  static init(config) {
    return (appInfo, isInServerlessEnv) => {
      if (_Recipe.instance === void 0) {
        _Recipe.instance = new _Recipe(_Recipe.RECIPE_ID, appInfo, isInServerlessEnv, config, {
          emailDelivery: void 0,
          smsDelivery: void 0
        });
        return _Recipe.instance;
      } else {
        throw new Error("Passwordless recipe has already been initialised. Please check your code for bugs.");
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
_Recipe.RECIPE_ID = "passwordless";
let Recipe = _Recipe;
export {
  Recipe as default
};
