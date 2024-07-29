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
var import_constants = require("./constants");
var import_signup = __toESM(require("./api/signup"), 1);
var import_signin = __toESM(require("./api/signin"), 1);
var import_generatePasswordResetToken = __toESM(require("./api/generatePasswordResetToken"), 1);
var import_passwordReset = __toESM(require("./api/passwordReset"), 1);
var import_utils2 = require("../../utils");
var import_emailExists = __toESM(require("./api/emailExists"), 1);
var import_recipeImplementation = __toESM(require("./recipeImplementation"), 1);
var import_implementation = __toESM(require("./api/implementation"), 1);
var import_querier = require("../../querier");
var import_supertokens_js_override = __toESM(require("supertokens-js-override"), 1);
var import_emaildelivery = __toESM(require("../../ingredients/emaildelivery"), 1);
var import_postSuperTokensInitCallbacks = require("../../postSuperTokensInitCallbacks");
var import_recipe = __toESM(require("../multifactorauth/recipe"), 1);
var import_recipe2 = __toESM(require("../multitenancy/recipe"), 1);
var import_utils3 = require("../thirdparty/utils");
var import_multifactorauth = require("../multifactorauth");
var import_node_process = require("node:process");
const _Recipe = class _Recipe extends import_recipeModule.default {
  constructor(recipeId, appInfo, isInServerlessEnv, config, ingredients) {
    super(recipeId, appInfo);
    // abstract instance functions below...............
    this.getAPIsHandled = () => {
      return [
        {
          method: "post",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.SIGN_UP_API),
          id: import_constants.SIGN_UP_API,
          disabled: this.apiImpl.signUpPOST === void 0
        },
        {
          method: "post",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.SIGN_IN_API),
          id: import_constants.SIGN_IN_API,
          disabled: this.apiImpl.signInPOST === void 0
        },
        {
          method: "post",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.GENERATE_PASSWORD_RESET_TOKEN_API),
          id: import_constants.GENERATE_PASSWORD_RESET_TOKEN_API,
          disabled: this.apiImpl.generatePasswordResetTokenPOST === void 0
        },
        {
          method: "post",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.PASSWORD_RESET_API),
          id: import_constants.PASSWORD_RESET_API,
          disabled: this.apiImpl.passwordResetPOST === void 0
        },
        {
          method: "get",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.SIGNUP_EMAIL_EXISTS_API),
          id: import_constants.SIGNUP_EMAIL_EXISTS_API,
          disabled: this.apiImpl.emailExistsGET === void 0
        },
        {
          method: "get",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.SIGNUP_EMAIL_EXISTS_API_OLD),
          id: import_constants.SIGNUP_EMAIL_EXISTS_API_OLD,
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
      if (id === import_constants.SIGN_UP_API) {
        return await (0, import_signup.default)(this.apiImpl, tenantId, options, userContext);
      } else if (id === import_constants.SIGN_IN_API) {
        return await (0, import_signin.default)(this.apiImpl, tenantId, options, userContext);
      } else if (id === import_constants.GENERATE_PASSWORD_RESET_TOKEN_API) {
        return await (0, import_generatePasswordResetToken.default)(this.apiImpl, tenantId, options, userContext);
      } else if (id === import_constants.PASSWORD_RESET_API) {
        return await (0, import_passwordReset.default)(this.apiImpl, tenantId, options, userContext);
      } else if (id === import_constants.SIGNUP_EMAIL_EXISTS_API || id === import_constants.SIGNUP_EMAIL_EXISTS_API_OLD) {
        return await (0, import_emailExists.default)(this.apiImpl, tenantId, options, userContext);
      }
      return false;
    };
    this.handleError = async (err, _request, response) => {
      if (err.fromRecipe === _Recipe.RECIPE_ID) {
        if (err.type === import_error.default.FIELD_ERROR) {
          return (0, import_utils2.send200Response)(response, {
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
      return import_error.default.isErrorFromSuperTokens(err) && err.fromRecipe === _Recipe.RECIPE_ID;
    };
    this.isInServerlessEnv = isInServerlessEnv;
    this.config = (0, import_utils.validateAndNormaliseUserInput)(this, appInfo, config);
    {
      const getEmailPasswordConfig = () => this.config;
      let builder = new import_supertokens_js_override.default(
        (0, import_recipeImplementation.default)(import_querier.Querier.getNewInstanceOrThrowError(recipeId), getEmailPasswordConfig)
      );
      this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
    }
    {
      let builder = new import_supertokens_js_override.default((0, import_implementation.default)());
      this.apiImpl = builder.override(this.config.override.apis).build();
    }
    this.emailDelivery = ingredients.emailDelivery === void 0 ? new import_emaildelivery.default(this.config.getEmailDeliveryConfig(this.isInServerlessEnv)) : ingredients.emailDelivery;
    import_postSuperTokensInitCallbacks.PostSuperTokensInitCallbacks.addPostInitCallback(() => {
      const mfaInstance = import_recipe.default.getInstance();
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
              ...recipeLoginMethodsOrderedByTimeJoinedOldestFirst.filter((lm) => !(0, import_utils3.isFakeEmail)(lm.email) && lm.verified === true).map((lm) => lm.email),
              // Then we take the non-verified real emails associated with emailpassword login methods ordered by timeJoined (oldest first)
              ...recipeLoginMethodsOrderedByTimeJoinedOldestFirst.filter((lm) => !(0, import_utils3.isFakeEmail)(lm.email) && lm.verified === false).map((lm) => lm.email),
              // Lastly, fake emails associated with emailpassword login methods ordered by timeJoined (oldest first)
              // We also add these into the list because they already have a password added to them so they can be a valid choice when signing in
              // We do not want to remove the previously added "MFA password", because a new email password user was linked
              // E.g.:
              // 1. A discord user adds a password for MFA (which will use the fake email associated with the discord user)
              // 2. Later they also sign up and (manually) link a full emailpassword user that they intend to use as a first factor
              // 3. The next time they sign in using Discord, they could be asked for a secondary password.
              // In this case, they'd be checked against the first user that they originally created for MFA, not the one later linked to the account
              ...recipeLoginMethodsOrderedByTimeJoinedOldestFirst.filter((lm) => (0, import_utils3.isFakeEmail)(lm.email)).map((lm) => lm.email)
            ];
          } else {
            if (orderedLoginMethodsByTimeJoinedOldestFirst.some(
              (lm) => lm.email !== void 0 && !(0, import_utils3.isFakeEmail)(lm.email)
            )) {
              result = orderedLoginMethodsByTimeJoinedOldestFirst.filter((lm) => lm.email !== void 0 && !(0, import_utils3.isFakeEmail)(lm.email)).map((lm) => lm.email);
            } else {
              result = orderedLoginMethodsByTimeJoinedOldestFirst.filter((lm) => lm.email !== void 0 && (0, import_utils3.isFakeEmail)(lm.email)).map((lm) => lm.email);
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
      const mtRecipe = import_recipe2.default.getInstance();
      if (mtRecipe !== void 0) {
        mtRecipe.allAvailableFirstFactors.push(import_multifactorauth.FactorIds.EMAILPASSWORD);
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
    if (import_node_process.env.TEST_MODE !== "testing") {
      throw new Error("calling testing function in non testing env");
    }
    _Recipe.instance = void 0;
  }
};
_Recipe.instance = void 0;
_Recipe.RECIPE_ID = "emailpassword";
let Recipe = _Recipe;
