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
var import_generateEmailVerifyToken = __toESM(require("./api/generateEmailVerifyToken"), 1);
var import_emailVerify = __toESM(require("./api/emailVerify"), 1);
var import_recipeImplementation = __toESM(require("./recipeImplementation"), 1);
var import_implementation = __toESM(require("./api/implementation"), 1);
var import_querier = require("../../querier");
var import_supertokens_js_override = __toESM(require("supertokens-js-override"), 1);
var import_emaildelivery = __toESM(require("../../ingredients/emaildelivery"), 1);
var import_postSuperTokensInitCallbacks = require("../../postSuperTokensInitCallbacks");
var import_recipe = __toESM(require("../session/recipe"), 1);
var import_emailVerificationClaim = require("./emailVerificationClaim");
var import_error2 = __toESM(require("../session/error"), 1);
var import_session = __toESM(require("../session"), 1);
var import__ = require("../..");
var import_logger = require("../../logger");
var import_node_process = require("node:process");
const _Recipe = class _Recipe extends import_recipeModule.default {
  constructor(recipeId, appInfo, isInServerlessEnv, config, ingredients) {
    super(recipeId, appInfo);
    // abstract instance functions below...............
    this.getAPIsHandled = () => {
      return [
        {
          method: "post",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.GENERATE_EMAIL_VERIFY_TOKEN_API),
          id: import_constants.GENERATE_EMAIL_VERIFY_TOKEN_API,
          disabled: this.apiImpl.generateEmailVerifyTokenPOST === void 0
        },
        {
          method: "post",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.EMAIL_VERIFY_API),
          id: import_constants.EMAIL_VERIFY_API,
          disabled: this.apiImpl.verifyEmailPOST === void 0
        },
        {
          method: "get",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.EMAIL_VERIFY_API),
          id: import_constants.EMAIL_VERIFY_API,
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
      if (id === import_constants.GENERATE_EMAIL_VERIFY_TOKEN_API) {
        return await (0, import_generateEmailVerifyToken.default)(this.apiImpl, options, userContext);
      } else {
        return await (0, import_emailVerify.default)(this.apiImpl, tenantId, options, userContext);
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
    this.getEmailForRecipeUserId = async (user, recipeUserId, userContext) => {
      if (this.config.getEmailForRecipeUserId !== void 0) {
        const userRes = await this.config.getEmailForRecipeUserId(recipeUserId, userContext);
        if (userRes.status !== "UNKNOWN_USER_ID_ERROR") {
          return userRes;
        }
      }
      if (user === void 0) {
        user = await (0, import__.getUser)(recipeUserId.getAsString(), userContext);
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
      let primaryUser = await (0, import__.getUser)(recipeUserId.getAsString(), userContext);
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
        (0, import_logger.logDebugMessage)("updateSessionIfRequiredPostEmailVerification got session");
        if (input.session.getRecipeUserId(input.userContext).getAsString() === input.recipeUserIdWhoseEmailGotVerified.getAsString()) {
          (0, import_logger.logDebugMessage)(
            "updateSessionIfRequiredPostEmailVerification the session belongs to the verified user"
          );
          if (input.session.getUserId() === primaryUserId) {
            (0, import_logger.logDebugMessage)(
              "updateSessionIfRequiredPostEmailVerification the session userId matches the primary user id, so we are only refreshing the claim"
            );
            try {
              await input.session.fetchAndSetClaim(import_emailVerificationClaim.EmailVerificationClaim, input.userContext);
            } catch (err) {
              if (err.message === "UNKNOWN_USER_ID") {
                throw new import_error2.default({
                  type: import_error2.default.UNAUTHORISED,
                  message: "Unknown User ID provided"
                });
              }
              throw err;
            }
            return;
          } else {
            (0, import_logger.logDebugMessage)(
              "updateSessionIfRequiredPostEmailVerification the session user id doesn't match the primary user id, so we are revoking all sessions and creating a new one"
            );
            await import_session.default.revokeAllSessionsForUser(
              input.recipeUserIdWhoseEmailGotVerified.getAsString(),
              false,
              input.session.getTenantId(),
              input.userContext
            );
            return await import_session.default.createNewSession(
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
          (0, import_logger.logDebugMessage)(
            "updateSessionIfRequiredPostEmailVerification the verified user doesn't match the session"
          );
          return void 0;
        }
      } else {
        (0, import_logger.logDebugMessage)("updateSessionIfRequiredPostEmailVerification got no session");
        return void 0;
      }
    };
    this.config = (0, import_utils.validateAndNormaliseUserInput)(this, appInfo, config);
    this.isInServerlessEnv = isInServerlessEnv;
    {
      let builder = new import_supertokens_js_override.default(
        (0, import_recipeImplementation.default)(import_querier.Querier.getNewInstanceOrThrowError(recipeId), this.getEmailForRecipeUserId)
      );
      this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
    }
    {
      let builder = new import_supertokens_js_override.default((0, import_implementation.default)());
      this.apiImpl = builder.override(this.config.override.apis).build();
    }
    this.emailDelivery = ingredients.emailDelivery === void 0 ? new import_emaildelivery.default(this.config.getEmailDeliveryConfig(this.isInServerlessEnv)) : ingredients.emailDelivery;
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
        import_postSuperTokensInitCallbacks.PostSuperTokensInitCallbacks.addPostInitCallback(() => {
          import_recipe.default.getInstanceOrThrowError().addClaimFromOtherRecipe(import_emailVerificationClaim.EmailVerificationClaim);
          if (config.mode === "REQUIRED") {
            import_recipe.default.getInstanceOrThrowError().addClaimValidatorFromOtherRecipe(
              import_emailVerificationClaim.EmailVerificationClaim.validators.isVerified()
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
    if (import_node_process.env.TEST_MODE !== "testing") {
      throw new Error("calling testing function in non testing env");
    }
    _Recipe.instance = void 0;
  }
};
_Recipe.instance = void 0;
_Recipe.RECIPE_ID = "emailverification";
let Recipe = _Recipe;
