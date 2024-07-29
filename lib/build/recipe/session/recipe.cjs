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
  default: () => SessionRecipe
});
module.exports = __toCommonJS(recipe_exports);
var import_recipeModule = __toESM(require("../../recipeModule"), 1);
var import_error = __toESM(require("./error"), 1);
var import_utils = require("./utils");
var import_refresh = __toESM(require("./api/refresh"), 1);
var import_signout = __toESM(require("./api/signout"), 1);
var import_constants = require("./constants");
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import_cookieAndHeaders = require("./cookieAndHeaders");
var import_recipeImplementation = __toESM(require("./recipeImplementation"), 1);
var import_querier = require("../../querier");
var import_implementation = __toESM(require("./api/implementation"), 1);
var import_supertokens_js_override = __toESM(require("supertokens-js-override"), 1);
var import_recipe = __toESM(require("../openid/recipe"), 1);
var import_logger = require("../../logger");
var import_node_process = require("node:process");
const _SessionRecipe = class _SessionRecipe extends import_recipeModule.default {
  constructor(recipeId, appInfo, isInServerlessEnv, config) {
    super(recipeId, appInfo);
    this.claimsAddedByOtherRecipes = [];
    this.claimValidatorsAddedByOtherRecipes = [];
    this.addClaimFromOtherRecipe = (claim) => {
      if (this.claimsAddedByOtherRecipes.some((c) => c.key === claim.key)) {
        throw new Error("Claim added by multiple recipes");
      }
      this.claimsAddedByOtherRecipes.push(claim);
    };
    this.getClaimsAddedByOtherRecipes = () => {
      return this.claimsAddedByOtherRecipes;
    };
    this.addClaimValidatorFromOtherRecipe = (builder) => {
      this.claimValidatorsAddedByOtherRecipes.push(builder);
    };
    this.getClaimValidatorsAddedByOtherRecipes = () => {
      return this.claimValidatorsAddedByOtherRecipes;
    };
    // abstract instance functions below...............
    this.getAPIsHandled = () => {
      let apisHandled = [
        {
          method: "post",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.REFRESH_API_PATH),
          id: import_constants.REFRESH_API_PATH,
          disabled: this.apiImpl.refreshPOST === void 0
        },
        {
          method: "post",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.SIGNOUT_API_PATH),
          id: import_constants.SIGNOUT_API_PATH,
          disabled: this.apiImpl.signOutPOST === void 0
        }
      ];
      apisHandled.push(...this.openIdRecipe.getAPIsHandled());
      return apisHandled;
    };
    this.handleAPIRequest = async (id, tenantId, req, res, path, method, userContext) => {
      let options = {
        config: this.config,
        recipeId: this.getRecipeId(),
        isInServerlessEnv: this.isInServerlessEnv,
        recipeImplementation: this.recipeInterfaceImpl,
        req,
        res
      };
      if (id === import_constants.REFRESH_API_PATH) {
        return await (0, import_refresh.default)(this.apiImpl, options, userContext);
      } else if (id === import_constants.SIGNOUT_API_PATH) {
        return await (0, import_signout.default)(this.apiImpl, options, userContext);
      } else {
        return await this.openIdRecipe.handleAPIRequest(id, tenantId, req, res, path, method, userContext);
      }
    };
    this.handleError = async (err, request, response, userContext) => {
      if (err.fromRecipe === _SessionRecipe.RECIPE_ID) {
        if (err.type === import_error.default.UNAUTHORISED) {
          (0, import_logger.logDebugMessage)("errorHandler: returning UNAUTHORISED");
          if (err.payload === void 0 || err.payload.clearTokens === void 0 || err.payload.clearTokens === true) {
            (0, import_logger.logDebugMessage)("errorHandler: Clearing tokens because of UNAUTHORISED response");
            (0, import_cookieAndHeaders.clearSessionFromAllTokenTransferMethods)(this.config, response, request, userContext);
          }
          return await this.config.errorHandlers.onUnauthorised(err.message, request, response, userContext);
        } else if (err.type === import_error.default.TRY_REFRESH_TOKEN) {
          (0, import_logger.logDebugMessage)("errorHandler: returning TRY_REFRESH_TOKEN");
          return await this.config.errorHandlers.onTryRefreshToken(err.message, request, response, userContext);
        } else if (err.type === import_error.default.TOKEN_THEFT_DETECTED) {
          (0, import_logger.logDebugMessage)("errorHandler: returning TOKEN_THEFT_DETECTED");
          (0, import_logger.logDebugMessage)("errorHandler: Clearing tokens because of TOKEN_THEFT_DETECTED response");
          (0, import_cookieAndHeaders.clearSessionFromAllTokenTransferMethods)(this.config, response, request, userContext);
          return await this.config.errorHandlers.onTokenTheftDetected(
            err.payload.sessionHandle,
            err.payload.userId,
            err.payload.recipeUserId,
            request,
            response,
            userContext
          );
        } else if (err.type === import_error.default.INVALID_CLAIMS) {
          return await this.config.errorHandlers.onInvalidClaim(err.payload, request, response, userContext);
        } else if (err.type === import_error.default.CLEAR_DUPLICATE_SESSION_COOKIES) {
          (0, import_logger.logDebugMessage)("errorHandler: returning CLEAR_DUPLICATE_SESSION_COOKIES");
          return await this.config.errorHandlers.onClearDuplicateSessionCookies(
            err.message,
            request,
            response,
            userContext
          );
        } else {
          throw err;
        }
      } else {
        return await this.openIdRecipe.handleError(err, request, response, userContext);
      }
    };
    this.getAllCORSHeaders = () => {
      let corsHeaders = [...(0, import_cookieAndHeaders.getCORSAllowedHeaders)()];
      corsHeaders.push(...this.openIdRecipe.getAllCORSHeaders());
      return corsHeaders;
    };
    this.isErrorFromThisRecipe = (err) => {
      return import_error.default.isErrorFromSuperTokens(err) && (err.fromRecipe === _SessionRecipe.RECIPE_ID || this.openIdRecipe.isErrorFromThisRecipe(err));
    };
    this.verifySession = async (options, request, response, userContext) => {
      return await this.apiImpl.verifySession({
        verifySessionOptions: options,
        options: {
          config: this.config,
          req: request,
          res: response,
          recipeId: this.getRecipeId(),
          isInServerlessEnv: this.isInServerlessEnv,
          recipeImplementation: this.recipeInterfaceImpl
        },
        userContext
      });
    };
    this.config = (0, import_utils.validateAndNormaliseUserInput)(this, appInfo, config);
    const antiCsrfToLog = typeof this.config.antiCsrfFunctionOrString === "string" ? this.config.antiCsrfFunctionOrString : "function";
    (0, import_logger.logDebugMessage)("session init: antiCsrf: " + antiCsrfToLog);
    (0, import_logger.logDebugMessage)("session init: cookieDomain: " + this.config.cookieDomain);
    const sameSiteToPrint = config !== void 0 && config.cookieSameSite !== void 0 ? config.cookieSameSite : "default function";
    (0, import_logger.logDebugMessage)("session init: cookieSameSite: " + sameSiteToPrint);
    (0, import_logger.logDebugMessage)("session init: cookieSecure: " + this.config.cookieSecure);
    (0, import_logger.logDebugMessage)("session init: refreshTokenPath: " + this.config.refreshTokenPath.getAsStringDangerous());
    (0, import_logger.logDebugMessage)("session init: sessionExpiredStatusCode: " + this.config.sessionExpiredStatusCode);
    this.isInServerlessEnv = isInServerlessEnv;
    this.openIdRecipe = new import_recipe.default(recipeId, appInfo, isInServerlessEnv, {
      override: this.config.override.openIdFeature
    });
    let builder = new import_supertokens_js_override.default(
      (0, import_recipeImplementation.default)(
        import_querier.Querier.getNewInstanceOrThrowError(recipeId),
        this.config,
        this.getAppInfo(),
        () => this.recipeInterfaceImpl
      )
    );
    this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
    {
      let builder2 = new import_supertokens_js_override.default((0, import_implementation.default)());
      this.apiImpl = builder2.override(this.config.override.apis).build();
    }
  }
  static getInstanceOrThrowError() {
    if (_SessionRecipe.instance !== void 0) {
      return _SessionRecipe.instance;
    }
    throw new Error(
      "Initialisation not done. Did you forget to call the SuperTokens.init or Session.init function?"
    );
  }
  static init(config) {
    return (appInfo, isInServerlessEnv) => {
      if (_SessionRecipe.instance === void 0) {
        _SessionRecipe.instance = new _SessionRecipe(_SessionRecipe.RECIPE_ID, appInfo, isInServerlessEnv, config);
        return _SessionRecipe.instance;
      } else {
        throw new Error("Session recipe has already been initialised. Please check your code for bugs.");
      }
    };
  }
  static reset() {
    if (import_node_process.env.TEST_MODE !== "testing") {
      throw new Error("calling testing function in non testing env");
    }
    _SessionRecipe.instance = void 0;
  }
};
_SessionRecipe.instance = void 0;
_SessionRecipe.RECIPE_ID = "session";
let SessionRecipe = _SessionRecipe;
