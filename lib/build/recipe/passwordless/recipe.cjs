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
var recipe_exports = {};
__export(recipe_exports, {
  default: () => Recipe
});
module.exports = __toCommonJS(recipe_exports);
var import_recipeModule = __toESM(require("../../recipeModule"), 1);
var import_error = __toESM(require("./error"), 1);
var import_utils = require("./utils");
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import_recipeImplementation = __toESM(require("./recipeImplementation"), 1);
var import_implementation = __toESM(require("./api/implementation"), 1);
var import_querier = require("../../querier");
var import_supertokens_js_override = __toESM(require("supertokens-js-override"), 1);
var import_consumeCode = __toESM(require("./api/consumeCode"), 1);
var import_createCode = __toESM(require("./api/createCode"), 1);
var import_emailExists = __toESM(require("./api/emailExists"), 1);
var import_phoneNumberExists = __toESM(require("./api/phoneNumberExists"), 1);
var import_resendCode = __toESM(require("./api/resendCode"), 1);
var import_constants = require("./constants");
var import_emaildelivery = __toESM(require("../../ingredients/emaildelivery"), 1);
var import_smsdelivery = __toESM(require("../../ingredients/smsdelivery"), 1);
var import_postSuperTokensInitCallbacks = require("../../postSuperTokensInitCallbacks");
var import_recipe = __toESM(require("../multifactorauth/recipe"), 1);
var import_recipe2 = __toESM(require("../multitenancy/recipe"), 1);
var import_utils2 = require("../thirdparty/utils");
var import_multifactorauth = require("../multifactorauth");
var import_node_process = require("node:process");
const _Recipe = class _Recipe extends import_recipeModule.default {
  constructor(recipeId, appInfo, isInServerlessEnv, config, ingredients) {
    super(recipeId, appInfo);
    // abstract instance functions below...............
    this.getAPIsHandled = () => {
      return [
        {
          id: import_constants.CONSUME_CODE_API,
          disabled: this.apiImpl.consumeCodePOST === void 0,
          method: "post",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.CONSUME_CODE_API)
        },
        {
          id: import_constants.CREATE_CODE_API,
          disabled: this.apiImpl.createCodePOST === void 0,
          method: "post",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.CREATE_CODE_API)
        },
        {
          id: import_constants.DOES_EMAIL_EXIST_API,
          disabled: this.apiImpl.emailExistsGET === void 0,
          method: "get",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.DOES_EMAIL_EXIST_API)
        },
        {
          id: import_constants.DOES_EMAIL_EXIST_API_OLD,
          disabled: this.apiImpl.emailExistsGET === void 0,
          method: "get",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.DOES_EMAIL_EXIST_API_OLD)
        },
        {
          id: import_constants.DOES_PHONE_NUMBER_EXIST_API,
          disabled: this.apiImpl.phoneNumberExistsGET === void 0,
          method: "get",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.DOES_PHONE_NUMBER_EXIST_API)
        },
        {
          id: import_constants.DOES_PHONE_NUMBER_EXIST_API_OLD,
          disabled: this.apiImpl.phoneNumberExistsGET === void 0,
          method: "get",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.DOES_PHONE_NUMBER_EXIST_API_OLD)
        },
        {
          id: import_constants.RESEND_CODE_API,
          disabled: this.apiImpl.resendCodePOST === void 0,
          method: "post",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.RESEND_CODE_API)
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
      if (id === import_constants.CONSUME_CODE_API) {
        return await (0, import_consumeCode.default)(this.apiImpl, tenantId, options, userContext);
      } else if (id === import_constants.CREATE_CODE_API) {
        return await (0, import_createCode.default)(this.apiImpl, tenantId, options, userContext);
      } else if (id === import_constants.DOES_EMAIL_EXIST_API || id === import_constants.DOES_EMAIL_EXIST_API_OLD) {
        return await (0, import_emailExists.default)(this.apiImpl, tenantId, options, userContext);
      } else if (id === import_constants.DOES_PHONE_NUMBER_EXIST_API || id === import_constants.DOES_PHONE_NUMBER_EXIST_API_OLD) {
        return await (0, import_phoneNumberExists.default)(this.apiImpl, tenantId, options, userContext);
      } else {
        return await (0, import_resendCode.default)(this.apiImpl, tenantId, options, userContext);
      }
    };
    this.handleError = async (err, _, __) => {
      throw err;
    };
    this.getAllCORSHeaders = () => {
      return [];
    };
    this.isErrorFromThisRecipe = (err) => {
      return import_error.default.isErrorFromSuperTokens(err) && err.fromRecipe === _Recipe.RECIPE_ID;
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
    this.config = (0, import_utils.validateAndNormaliseUserInput)(this, appInfo, config);
    {
      let builder = new import_supertokens_js_override.default((0, import_recipeImplementation.default)(import_querier.Querier.getNewInstanceOrThrowError(recipeId)));
      this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
    }
    {
      let builder = new import_supertokens_js_override.default((0, import_implementation.default)());
      this.apiImpl = builder.override(this.config.override.apis).build();
    }
    this.emailDelivery = ingredients.emailDelivery === void 0 ? new import_emaildelivery.default(this.config.getEmailDeliveryConfig()) : ingredients.emailDelivery;
    this.smsDelivery = ingredients.smsDelivery === void 0 ? new import_smsdelivery.default(this.config.getSmsDeliveryConfig()) : ingredients.smsDelivery;
    let allFactors = (0, import_utils.getEnabledPwlessFactors)(this.config);
    import_postSuperTokensInitCallbacks.PostSuperTokensInitCallbacks.addPostInitCallback(() => {
      const mfaInstance = import_recipe.default.getInstance();
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
              if (loginMethod.email !== void 0 && !(0, import_utils2.isFakeEmail)(loginMethod.email)) {
                if (factorId === import_multifactorauth.FactorIds.OTP_EMAIL || factorId === import_multifactorauth.FactorIds.LINK_EMAIL) {
                  return true;
                }
              }
              if (loginMethod.phoneNumber !== void 0) {
                if (factorId === import_multifactorauth.FactorIds.OTP_PHONE || factorId === import_multifactorauth.FactorIds.LINK_PHONE) {
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
              if (orderedLoginMethodsByTimeJoinedOldestFirst[i].email !== void 0 && !(0, import_utils2.isFakeEmail)(orderedLoginMethodsByTimeJoinedOldestFirst[i].email)) {
                nonFakeEmailsThatPasswordlessLoginMethodOrderedByTimeJoined.push(
                  orderedLoginMethodsByTimeJoinedOldestFirst[i].email
                );
              }
            }
          }
          if (nonFakeEmailsThatPasswordlessLoginMethodOrderedByTimeJoined.length === 0) {
            let emailsResult2 = [];
            if (sessionLoginMethod.email !== void 0 && !(0, import_utils2.isFakeEmail)(sessionLoginMethod.email)) {
              emailsResult2 = [sessionLoginMethod.email];
            }
            for (let i = 0; i < orderedLoginMethodsByTimeJoinedOldestFirst.length; i++) {
              if (orderedLoginMethodsByTimeJoinedOldestFirst[i].email !== void 0 && !(0, import_utils2.isFakeEmail)(orderedLoginMethodsByTimeJoinedOldestFirst[i].email)) {
                if (!emailsResult2.includes(orderedLoginMethodsByTimeJoinedOldestFirst[i].email)) {
                  emailsResult2.push(orderedLoginMethodsByTimeJoinedOldestFirst[i].email);
                }
              }
            }
            let factorIdToEmailsMap2 = {};
            if (allFactors.includes(import_multifactorauth.FactorIds.OTP_EMAIL)) {
              factorIdToEmailsMap2[import_multifactorauth.FactorIds.OTP_EMAIL] = emailsResult2;
            }
            if (allFactors.includes(import_multifactorauth.FactorIds.LINK_EMAIL)) {
              factorIdToEmailsMap2[import_multifactorauth.FactorIds.LINK_EMAIL] = emailsResult2;
            }
            return {
              status: "OK",
              factorIdToEmailsMap: factorIdToEmailsMap2
            };
          } else if (nonFakeEmailsThatPasswordlessLoginMethodOrderedByTimeJoined.length === 1) {
            let factorIdToEmailsMap2 = {};
            if (allFactors.includes(import_multifactorauth.FactorIds.OTP_EMAIL)) {
              factorIdToEmailsMap2[import_multifactorauth.FactorIds.OTP_EMAIL] = nonFakeEmailsThatPasswordlessLoginMethodOrderedByTimeJoined;
            }
            if (allFactors.includes(import_multifactorauth.FactorIds.LINK_EMAIL)) {
              factorIdToEmailsMap2[import_multifactorauth.FactorIds.LINK_EMAIL] = nonFakeEmailsThatPasswordlessLoginMethodOrderedByTimeJoined;
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
          if (allFactors.includes(import_multifactorauth.FactorIds.OTP_EMAIL)) {
            factorIdToEmailsMap[import_multifactorauth.FactorIds.OTP_EMAIL] = emailsResult;
          }
          if (allFactors.includes(import_multifactorauth.FactorIds.LINK_EMAIL)) {
            factorIdToEmailsMap[import_multifactorauth.FactorIds.LINK_EMAIL] = emailsResult;
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
            if (allFactors.includes(import_multifactorauth.FactorIds.OTP_PHONE)) {
              factorIdToPhoneNumberMap2[import_multifactorauth.FactorIds.OTP_PHONE] = phonesResult2;
            }
            if (allFactors.includes(import_multifactorauth.FactorIds.LINK_PHONE)) {
              factorIdToPhoneNumberMap2[import_multifactorauth.FactorIds.LINK_PHONE] = phonesResult2;
            }
            return {
              status: "OK",
              factorIdToPhoneNumberMap: factorIdToPhoneNumberMap2
            };
          } else if (phoneNumbersThatPasswordlessLoginMethodOrderedByTimeJoined.length === 1) {
            let factorIdToPhoneNumberMap2 = {};
            if (allFactors.includes(import_multifactorauth.FactorIds.OTP_PHONE)) {
              factorIdToPhoneNumberMap2[import_multifactorauth.FactorIds.OTP_PHONE] = phoneNumbersThatPasswordlessLoginMethodOrderedByTimeJoined;
            }
            if (allFactors.includes(import_multifactorauth.FactorIds.LINK_PHONE)) {
              factorIdToPhoneNumberMap2[import_multifactorauth.FactorIds.LINK_PHONE] = phoneNumbersThatPasswordlessLoginMethodOrderedByTimeJoined;
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
          if (allFactors.includes(import_multifactorauth.FactorIds.OTP_PHONE)) {
            factorIdToPhoneNumberMap[import_multifactorauth.FactorIds.OTP_PHONE] = phonesResult;
          }
          if (allFactors.includes(import_multifactorauth.FactorIds.LINK_PHONE)) {
            factorIdToPhoneNumberMap[import_multifactorauth.FactorIds.LINK_PHONE] = phonesResult;
          }
          return {
            status: "OK",
            factorIdToPhoneNumberMap
          };
        });
      }
      const mtRecipe = import_recipe2.default.getInstance();
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
    if (import_node_process.env.TEST_MODE !== "testing") {
      throw new Error("calling testing function in non testing env");
    }
    _Recipe.instance = void 0;
  }
};
_Recipe.instance = void 0;
_Recipe.RECIPE_ID = "passwordless";
let Recipe = _Recipe;
