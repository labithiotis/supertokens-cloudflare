import RecipeModule from "../../recipeModule";
import STError from "./error";
import { validateAndNormaliseUserInput } from "./utils";
import handleRefreshAPI from "./api/refresh";
import signOutAPI from "./api/signout";
import { REFRESH_API_PATH, SIGNOUT_API_PATH } from "./constants";
import NormalisedURLPath from "../../normalisedURLPath";
import {
  clearSessionFromAllTokenTransferMethods,
  getCORSAllowedHeaders as getCORSAllowedHeadersFromCookiesAndHeaders
} from "./cookieAndHeaders";
import RecipeImplementation from "./recipeImplementation";
import { Querier } from "../../querier";
import APIImplementation from "./api/implementation";
import OverrideableBuilder from "supertokens-js-override";
import OpenIdRecipe from "../openid/recipe";
import { logDebugMessage } from "../../logger";
import { env } from "node:process";
const _SessionRecipe = class _SessionRecipe extends RecipeModule {
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
          pathWithoutApiBasePath: new NormalisedURLPath(REFRESH_API_PATH),
          id: REFRESH_API_PATH,
          disabled: this.apiImpl.refreshPOST === void 0
        },
        {
          method: "post",
          pathWithoutApiBasePath: new NormalisedURLPath(SIGNOUT_API_PATH),
          id: SIGNOUT_API_PATH,
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
      if (id === REFRESH_API_PATH) {
        return await handleRefreshAPI(this.apiImpl, options, userContext);
      } else if (id === SIGNOUT_API_PATH) {
        return await signOutAPI(this.apiImpl, options, userContext);
      } else {
        return await this.openIdRecipe.handleAPIRequest(id, tenantId, req, res, path, method, userContext);
      }
    };
    this.handleError = async (err, request, response, userContext) => {
      if (err.fromRecipe === _SessionRecipe.RECIPE_ID) {
        if (err.type === STError.UNAUTHORISED) {
          logDebugMessage("errorHandler: returning UNAUTHORISED");
          if (err.payload === void 0 || err.payload.clearTokens === void 0 || err.payload.clearTokens === true) {
            logDebugMessage("errorHandler: Clearing tokens because of UNAUTHORISED response");
            clearSessionFromAllTokenTransferMethods(this.config, response, request, userContext);
          }
          return await this.config.errorHandlers.onUnauthorised(err.message, request, response, userContext);
        } else if (err.type === STError.TRY_REFRESH_TOKEN) {
          logDebugMessage("errorHandler: returning TRY_REFRESH_TOKEN");
          return await this.config.errorHandlers.onTryRefreshToken(err.message, request, response, userContext);
        } else if (err.type === STError.TOKEN_THEFT_DETECTED) {
          logDebugMessage("errorHandler: returning TOKEN_THEFT_DETECTED");
          logDebugMessage("errorHandler: Clearing tokens because of TOKEN_THEFT_DETECTED response");
          clearSessionFromAllTokenTransferMethods(this.config, response, request, userContext);
          return await this.config.errorHandlers.onTokenTheftDetected(
            err.payload.sessionHandle,
            err.payload.userId,
            err.payload.recipeUserId,
            request,
            response,
            userContext
          );
        } else if (err.type === STError.INVALID_CLAIMS) {
          return await this.config.errorHandlers.onInvalidClaim(err.payload, request, response, userContext);
        } else if (err.type === STError.CLEAR_DUPLICATE_SESSION_COOKIES) {
          logDebugMessage("errorHandler: returning CLEAR_DUPLICATE_SESSION_COOKIES");
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
      let corsHeaders = [...getCORSAllowedHeadersFromCookiesAndHeaders()];
      corsHeaders.push(...this.openIdRecipe.getAllCORSHeaders());
      return corsHeaders;
    };
    this.isErrorFromThisRecipe = (err) => {
      return STError.isErrorFromSuperTokens(err) && (err.fromRecipe === _SessionRecipe.RECIPE_ID || this.openIdRecipe.isErrorFromThisRecipe(err));
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
    this.config = validateAndNormaliseUserInput(this, appInfo, config);
    const antiCsrfToLog = typeof this.config.antiCsrfFunctionOrString === "string" ? this.config.antiCsrfFunctionOrString : "function";
    logDebugMessage("session init: antiCsrf: " + antiCsrfToLog);
    logDebugMessage("session init: cookieDomain: " + this.config.cookieDomain);
    const sameSiteToPrint = config !== void 0 && config.cookieSameSite !== void 0 ? config.cookieSameSite : "default function";
    logDebugMessage("session init: cookieSameSite: " + sameSiteToPrint);
    logDebugMessage("session init: cookieSecure: " + this.config.cookieSecure);
    logDebugMessage("session init: refreshTokenPath: " + this.config.refreshTokenPath.getAsStringDangerous());
    logDebugMessage("session init: sessionExpiredStatusCode: " + this.config.sessionExpiredStatusCode);
    this.isInServerlessEnv = isInServerlessEnv;
    this.openIdRecipe = new OpenIdRecipe(recipeId, appInfo, isInServerlessEnv, {
      override: this.config.override.openIdFeature
    });
    let builder = new OverrideableBuilder(
      RecipeImplementation(
        Querier.getNewInstanceOrThrowError(recipeId),
        this.config,
        this.getAppInfo(),
        () => this.recipeInterfaceImpl
      )
    );
    this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
    {
      let builder2 = new OverrideableBuilder(APIImplementation());
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
    if (env.TEST_MODE !== "testing") {
      throw new Error("calling testing function in non testing env");
    }
    _SessionRecipe.instance = void 0;
  }
};
_SessionRecipe.instance = void 0;
_SessionRecipe.RECIPE_ID = "session";
let SessionRecipe = _SessionRecipe;
export {
  SessionRecipe as default
};
