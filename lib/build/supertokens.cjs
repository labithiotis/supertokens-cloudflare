"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
var supertokens_exports = {};
__export(supertokens_exports, {
  default: () => SuperTokens
});
module.exports = __toCommonJS(supertokens_exports);
var import_utils = require("./utils");
var import_querier = require("./querier");
var import_constants = require("./constants");
var import_normalisedURLDomain = __toESM(require("./normalisedURLDomain"), 1);
var import_normalisedURLPath = __toESM(require("./normalisedURLPath"), 1);
var import_error = __toESM(require("./error"), 1);
var import_logger = require("./logger");
var import_postSuperTokensInitCallbacks = require("./postSuperTokensInitCallbacks");
var import_constants2 = require("./recipe/multitenancy/constants");
var import_node_process = require("node:process");
var import_recipe = __toESM(require("./recipe/multitenancy/recipe"), 1);
var import_recipe2 = __toESM(require("./recipe/usermetadata/recipe"), 1);
var import_recipe3 = __toESM(require("./recipe/multifactorauth/recipe"), 1);
var import_recipe4 = __toESM(require("./recipe/totp/recipe"), 1);
class SuperTokens {
  constructor(config) {
    this.handleAPI = async (matchedRecipe, id, tenantId, request, response, path, method, userContext) => {
      return await matchedRecipe.handleAPIRequest(id, tenantId, request, response, path, method, userContext);
    };
    this.getAllCORSHeaders = () => {
      let headerSet = /* @__PURE__ */ new Set();
      headerSet.add(import_constants.HEADER_RID);
      headerSet.add(import_constants.HEADER_FDI);
      this.recipeModules.forEach((recipe) => {
        let headers = recipe.getAllCORSHeaders();
        headers.forEach((h) => {
          headerSet.add(h);
        });
      });
      return Array.from(headerSet);
    };
    this.getUserCount = async (includeRecipeIds, tenantId, userContext) => {
      let querier = import_querier.Querier.getNewInstanceOrThrowError(void 0);
      let apiVersion = await querier.getAPIVersion(userContext);
      if ((0, import_utils.maxVersion)(apiVersion, "2.7") === "2.7") {
        throw new Error(
          "Please use core version >= 3.5 to call this function. Otherwise, you can call <YourRecipe>.getUserCount() instead (for example, EmailPassword.getUserCount())"
        );
      }
      let includeRecipeIdsStr = void 0;
      if (includeRecipeIds !== void 0) {
        includeRecipeIdsStr = includeRecipeIds.join(",");
      }
      let response = await querier.sendGetRequest(
        new import_normalisedURLPath.default(`/${tenantId === void 0 ? import_constants2.DEFAULT_TENANT_ID : tenantId}/users/count`),
        {
          includeRecipeIds: includeRecipeIdsStr,
          includeAllTenants: tenantId === void 0
        },
        userContext
      );
      return Number(response.count);
    };
    this.createUserIdMapping = async function(input) {
      let querier = import_querier.Querier.getNewInstanceOrThrowError(void 0);
      let cdiVersion = await querier.getAPIVersion(input.userContext);
      if ((0, import_utils.maxVersion)("2.15", cdiVersion) === cdiVersion) {
        return await querier.sendPostRequest(
          new import_normalisedURLPath.default("/recipe/userid/map"),
          {
            superTokensUserId: input.superTokensUserId,
            externalUserId: input.externalUserId,
            externalUserIdInfo: input.externalUserIdInfo,
            force: input.force
          },
          input.userContext
        );
      } else {
        throw new global.Error("Please upgrade the SuperTokens core to >= 3.15.0");
      }
    };
    this.getUserIdMapping = async function(input) {
      let querier = import_querier.Querier.getNewInstanceOrThrowError(void 0);
      let cdiVersion = await querier.getAPIVersion(input.userContext);
      if ((0, import_utils.maxVersion)("2.15", cdiVersion) === cdiVersion) {
        let response = await querier.sendGetRequest(
          new import_normalisedURLPath.default("/recipe/userid/map"),
          {
            userId: input.userId,
            userIdType: input.userIdType
          },
          input.userContext
        );
        return response;
      } else {
        throw new global.Error("Please upgrade the SuperTokens core to >= 3.15.0");
      }
    };
    this.deleteUserIdMapping = async function(input) {
      let querier = import_querier.Querier.getNewInstanceOrThrowError(void 0);
      let cdiVersion = await querier.getAPIVersion(input.userContext);
      if ((0, import_utils.maxVersion)("2.15", cdiVersion) === cdiVersion) {
        return await querier.sendPostRequest(
          new import_normalisedURLPath.default("/recipe/userid/map/remove"),
          {
            userId: input.userId,
            userIdType: input.userIdType,
            force: input.force
          },
          input.userContext
        );
      } else {
        throw new global.Error("Please upgrade the SuperTokens core to >= 3.15.0");
      }
    };
    this.updateOrDeleteUserIdMappingInfo = async function(input) {
      let querier = import_querier.Querier.getNewInstanceOrThrowError(void 0);
      let cdiVersion = await querier.getAPIVersion(input.userContext);
      if ((0, import_utils.maxVersion)("2.15", cdiVersion) === cdiVersion) {
        return await querier.sendPutRequest(
          new import_normalisedURLPath.default("/recipe/userid/external-user-id-info"),
          {
            userId: input.userId,
            userIdType: input.userIdType,
            externalUserIdInfo: input.externalUserIdInfo
          },
          input.userContext
        );
      } else {
        throw new global.Error("Please upgrade the SuperTokens core to >= 3.15.0");
      }
    };
    this.middleware = async (request, response, userContext) => {
      (0, import_logger.logDebugMessage)("middleware: Started");
      let path = this.appInfo.apiGatewayPath.appendPath(new import_normalisedURLPath.default(request.getOriginalURL()));
      let method = (0, import_utils.normaliseHttpMethod)(request.getMethod());
      if (!path.startsWith(this.appInfo.apiBasePath)) {
        (0, import_logger.logDebugMessage)(
          "middleware: Not handling because request path did not start with config path. Request path: " + path.getAsStringDangerous()
        );
        return false;
      }
      let requestRID = (0, import_utils.getRidFromHeader)(request);
      (0, import_logger.logDebugMessage)("middleware: requestRID is: " + requestRID);
      if (requestRID === "anti-csrf") {
        requestRID = void 0;
      }
      async function handleWithoutRid(recipeModules) {
        for (let i = 0; i < recipeModules.length; i++) {
          (0, import_logger.logDebugMessage)(
            "middleware: Checking recipe ID for match: " + recipeModules[i].getRecipeId() + " with path: " + path.getAsStringDangerous() + " and method: " + method
          );
          let idResult = await recipeModules[i].returnAPIIdIfCanHandleRequest(path, method, userContext);
          if (idResult !== void 0) {
            (0, import_logger.logDebugMessage)("middleware: Request being handled by recipe. ID is: " + idResult.id);
            let requestHandled = await recipeModules[i].handleAPIRequest(
              idResult.id,
              idResult.tenantId,
              request,
              response,
              path,
              method,
              userContext
            );
            if (!requestHandled) {
              (0, import_logger.logDebugMessage)("middleware: Not handled because API returned requestHandled as false");
              return false;
            }
            (0, import_logger.logDebugMessage)("middleware: Ended");
            return true;
          }
        }
        (0, import_logger.logDebugMessage)("middleware: Not handling because no recipe matched");
        return false;
      }
      if (requestRID !== void 0) {
        let matchedRecipe = [];
        for (let i = 0; i < this.recipeModules.length; i++) {
          (0, import_logger.logDebugMessage)("middleware: Checking recipe ID for match: " + this.recipeModules[i].getRecipeId());
          if (this.recipeModules[i].getRecipeId() === requestRID) {
            matchedRecipe.push(this.recipeModules[i]);
          } else if (requestRID === "thirdpartyemailpassword") {
            if (this.recipeModules[i].getRecipeId() === "thirdparty" || this.recipeModules[i].getRecipeId() === "emailpassword") {
              matchedRecipe.push(this.recipeModules[i]);
            }
          } else if (requestRID === "thirdpartypasswordless") {
            if (this.recipeModules[i].getRecipeId() === "thirdparty" || this.recipeModules[i].getRecipeId() === "passwordless") {
              matchedRecipe.push(this.recipeModules[i]);
            }
          }
        }
        if (matchedRecipe.length === 0) {
          (0, import_logger.logDebugMessage)("middleware: Not handling based on rid match. Trying without rid.");
          return handleWithoutRid(this.recipeModules);
        }
        for (let i = 0; i < matchedRecipe.length; i++) {
          (0, import_logger.logDebugMessage)("middleware: Matched with recipe IDs: " + matchedRecipe[i].getRecipeId());
        }
        let idResult = void 0;
        let finalMatchedRecipe = void 0;
        for (let i = 0; i < matchedRecipe.length; i++) {
          let currIdResult = await matchedRecipe[i].returnAPIIdIfCanHandleRequest(path, method, userContext);
          if (currIdResult !== void 0) {
            if (idResult !== void 0) {
              throw new Error(
                "Two recipes have matched the same API path and method! This is a bug in the SDK. Please contact support."
              );
            } else {
              finalMatchedRecipe = matchedRecipe[i];
              idResult = currIdResult;
            }
          }
        }
        if (idResult === void 0 || finalMatchedRecipe === void 0) {
          return handleWithoutRid(this.recipeModules);
        }
        (0, import_logger.logDebugMessage)("middleware: Request being handled by recipe. ID is: " + idResult.id);
        let requestHandled = await finalMatchedRecipe.handleAPIRequest(
          idResult.id,
          idResult.tenantId,
          request,
          response,
          path,
          method,
          userContext
        );
        if (!requestHandled) {
          (0, import_logger.logDebugMessage)("middleware: Not handled because API returned requestHandled as false");
          return false;
        }
        (0, import_logger.logDebugMessage)("middleware: Ended");
        return true;
      } else {
        return handleWithoutRid(this.recipeModules);
      }
    };
    this.errorHandler = async (err, request, response, userContext) => {
      (0, import_logger.logDebugMessage)("errorHandler: Started");
      if (import_error.default.isErrorFromSuperTokens(err)) {
        (0, import_logger.logDebugMessage)("errorHandler: Error is from SuperTokens recipe. Message: " + err.message);
        if (err.type === import_error.default.BAD_INPUT_ERROR) {
          (0, import_logger.logDebugMessage)("errorHandler: Sending 400 status code response");
          return (0, import_utils.sendNon200ResponseWithMessage)(response, err.message, 400);
        }
        for (let i = 0; i < this.recipeModules.length; i++) {
          (0, import_logger.logDebugMessage)("errorHandler: Checking recipe for match: " + this.recipeModules[i].getRecipeId());
          if (this.recipeModules[i].isErrorFromThisRecipe(err)) {
            (0, import_logger.logDebugMessage)("errorHandler: Matched with recipeID: " + this.recipeModules[i].getRecipeId());
            return await this.recipeModules[i].handleError(err, request, response, userContext);
          }
        }
      }
      throw err;
    };
    this.getRequestFromUserContext = (userContext) => {
      if (userContext === void 0) {
        return void 0;
      }
      if (typeof userContext !== "object") {
        return void 0;
      }
      if (userContext._default === void 0) {
        return void 0;
      }
      if (userContext._default.request === void 0) {
        return void 0;
      }
      return userContext._default.request;
    };
    var _a, _b, _c, _d;
    if (config.debug === true) {
      (0, import_logger.enableDebugLogs)();
    }
    (0, import_logger.logDebugMessage)("Started SuperTokens with debug logging (supertokens.init called)");
    const originToPrint = config.appInfo.origin === void 0 ? void 0 : typeof config.appInfo.origin === "string" ? config.appInfo.origin : "function";
    (0, import_logger.logDebugMessage)(
      "appInfo: " + JSON.stringify(__spreadProps(__spreadValues({}, config.appInfo), {
        origin: originToPrint
      }))
    );
    this.framework = config.framework !== void 0 ? config.framework : "express";
    (0, import_logger.logDebugMessage)("framework: " + this.framework);
    this.appInfo = (0, import_utils.normaliseInputAppInfoOrThrowError)(config.appInfo);
    this.supertokens = config.supertokens;
    import_querier.Querier.init(
      (_a = config.supertokens) == null ? void 0 : _a.connectionURI.split(";").filter((h) => h !== "").map((h) => {
        return {
          domain: new import_normalisedURLDomain.default(h.trim()),
          basePath: new import_normalisedURLPath.default(h.trim())
        };
      }),
      (_b = config.supertokens) == null ? void 0 : _b.apiKey,
      (_c = config.supertokens) == null ? void 0 : _c.networkInterceptor,
      (_d = config.supertokens) == null ? void 0 : _d.disableCoreCallCache
    );
    if (config.recipeList === void 0 || config.recipeList.length === 0) {
      throw new Error("Please provide at least one recipe to the supertokens.init function call");
    }
    if (config.recipeList.includes(void 0)) {
      throw new Error("Please remove empty items from recipeList");
    }
    this.isInServerlessEnv = config.isInServerlessEnv === void 0 ? false : config.isInServerlessEnv;
    let multitenancyFound = false;
    let totpFound = false;
    let userMetadataFound = false;
    let multiFactorAuthFound = false;
    this.recipeModules = config.recipeList.map((func) => {
      const recipeModule = func(this.appInfo, this.isInServerlessEnv);
      if (recipeModule.getRecipeId() === import_recipe.default.RECIPE_ID) {
        multitenancyFound = true;
      } else if (recipeModule.getRecipeId() === import_recipe2.default.RECIPE_ID) {
        userMetadataFound = true;
      } else if (recipeModule.getRecipeId() === import_recipe3.default.RECIPE_ID) {
        multiFactorAuthFound = true;
      } else if (recipeModule.getRecipeId() === import_recipe4.default.RECIPE_ID) {
        totpFound = true;
      }
      return recipeModule;
    });
    if (!multitenancyFound) {
      this.recipeModules.push(import_recipe.default.init()(this.appInfo, this.isInServerlessEnv));
    }
    if (totpFound && !multiFactorAuthFound) {
      throw new Error("Please initialize the MultiFactorAuth recipe to use TOTP.");
    }
    if (!userMetadataFound) {
      this.recipeModules.push(import_recipe2.default.init()(this.appInfo, this.isInServerlessEnv));
    }
    this.telemetryEnabled = config.telemetry === void 0 ? import_node_process.env.TEST_MODE !== "testing" : config.telemetry;
  }
  static init(config) {
    if (SuperTokens.instance === void 0) {
      SuperTokens.instance = new SuperTokens(config);
      import_postSuperTokensInitCallbacks.PostSuperTokensInitCallbacks.runPostInitCallbacks();
    }
  }
  static reset() {
    if (import_node_process.env.TEST_MODE !== "testing") {
      throw new Error("calling testing function in non testing env");
    }
    import_querier.Querier.reset();
    SuperTokens.instance = void 0;
  }
  static getInstanceOrThrowError() {
    if (SuperTokens.instance !== void 0) {
      return SuperTokens.instance;
    }
    throw new Error("Initialisation not done. Did you forget to call the SuperTokens.init function?");
  }
}