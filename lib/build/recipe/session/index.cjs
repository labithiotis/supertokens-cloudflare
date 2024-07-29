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
var session_exports = {};
__export(session_exports, {
  Error: () => Error2,
  createJWT: () => createJWT,
  createNewSession: () => createNewSession,
  createNewSessionWithoutRequestResponse: () => createNewSessionWithoutRequestResponse,
  default: () => SessionWrapper,
  fetchAndSetClaim: () => fetchAndSetClaim,
  getAllSessionHandlesForUser: () => getAllSessionHandlesForUser,
  getClaimValue: () => getClaimValue,
  getJWKS: () => getJWKS,
  getOpenIdDiscoveryConfiguration: () => getOpenIdDiscoveryConfiguration,
  getSession: () => getSession,
  getSessionInformation: () => getSessionInformation,
  getSessionWithoutRequestResponse: () => getSessionWithoutRequestResponse,
  init: () => init,
  mergeIntoAccessTokenPayload: () => mergeIntoAccessTokenPayload,
  refreshSession: () => refreshSession,
  refreshSessionWithoutRequestResponse: () => refreshSessionWithoutRequestResponse,
  removeClaim: () => removeClaim,
  revokeAllSessionsForUser: () => revokeAllSessionsForUser,
  revokeMultipleSessions: () => revokeMultipleSessions,
  revokeSession: () => revokeSession,
  setClaimValue: () => setClaimValue,
  updateSessionDataInDatabase: () => updateSessionDataInDatabase,
  validateClaimsForSessionHandle: () => validateClaimsForSessionHandle
});
module.exports = __toCommonJS(session_exports);
var import_error = __toESM(require("./error"), 1);
var import_recipe = __toESM(require("./recipe"), 1);
var import_utils = require("./utils");
var import_sessionRequestFunctions = require("./sessionRequestFunctions");
var import__ = require("../..");
var import_constants = require("../multitenancy/constants");
var import_constants2 = require("./constants");
var import_utils2 = require("../../utils");
class SessionWrapper {
  static async createNewSession(req, res, tenantId, recipeUserId, accessTokenPayload = {}, sessionDataInDatabase = {}, userContext) {
    const recipeInstance = import_recipe.default.getInstanceOrThrowError();
    const config = recipeInstance.config;
    const appInfo = recipeInstance.getAppInfo();
    let user = await (0, import__.getUser)(recipeUserId.getAsString(), userContext);
    let userId = recipeUserId.getAsString();
    if (user !== void 0) {
      userId = user.id;
    }
    return await (0, import_sessionRequestFunctions.createNewSessionInRequest)({
      req,
      res,
      userContext: (0, import_utils2.getUserContext)(userContext),
      recipeInstance,
      accessTokenPayload,
      userId,
      recipeUserId,
      config,
      appInfo,
      sessionDataInDatabase,
      tenantId
    });
  }
  static async createNewSessionWithoutRequestResponse(tenantId, recipeUserId, accessTokenPayload = {}, sessionDataInDatabase = {}, disableAntiCsrf = false, userContext) {
    const ctx = (0, import_utils2.getUserContext)(userContext);
    const recipeInstance = import_recipe.default.getInstanceOrThrowError();
    const claimsAddedByOtherRecipes = recipeInstance.getClaimsAddedByOtherRecipes();
    const appInfo = recipeInstance.getAppInfo();
    const issuer = appInfo.apiDomain.getAsStringDangerous() + appInfo.apiBasePath.getAsStringDangerous();
    let finalAccessTokenPayload = __spreadProps(__spreadValues({}, accessTokenPayload), {
      iss: issuer
    });
    for (const prop of import_constants2.protectedProps) {
      delete finalAccessTokenPayload[prop];
    }
    let user = await (0, import__.getUser)(recipeUserId.getAsString(), ctx);
    let userId = recipeUserId.getAsString();
    if (user !== void 0) {
      userId = user.id;
    }
    for (const claim of claimsAddedByOtherRecipes) {
      const update = await claim.build(userId, recipeUserId, tenantId, finalAccessTokenPayload, ctx);
      finalAccessTokenPayload = __spreadValues(__spreadValues({}, finalAccessTokenPayload), update);
    }
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.createNewSession({
      userId,
      recipeUserId,
      accessTokenPayload: finalAccessTokenPayload,
      sessionDataInDatabase,
      disableAntiCsrf,
      tenantId,
      userContext: ctx
    });
  }
  static async validateClaimsForSessionHandle(sessionHandle, overrideGlobalClaimValidators, userContext) {
    const ctx = (0, import_utils2.getUserContext)(userContext);
    const recipeImpl = import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl;
    const sessionInfo = await recipeImpl.getSessionInformation({
      sessionHandle,
      userContext: ctx
    });
    if (sessionInfo === void 0) {
      return {
        status: "SESSION_DOES_NOT_EXIST_ERROR"
      };
    }
    const claimValidatorsAddedByOtherRecipes = import_recipe.default.getInstanceOrThrowError().getClaimValidatorsAddedByOtherRecipes();
    const globalClaimValidators = await recipeImpl.getGlobalClaimValidators({
      userId: sessionInfo.userId,
      recipeUserId: sessionInfo.recipeUserId,
      tenantId: sessionInfo.tenantId,
      claimValidatorsAddedByOtherRecipes,
      userContext: ctx
    });
    const claimValidators = overrideGlobalClaimValidators !== void 0 ? await overrideGlobalClaimValidators(globalClaimValidators, sessionInfo, ctx) : globalClaimValidators;
    let claimValidationResponse = await recipeImpl.validateClaims({
      userId: sessionInfo.userId,
      recipeUserId: sessionInfo.recipeUserId,
      accessTokenPayload: sessionInfo.customClaimsInAccessTokenPayload,
      claimValidators,
      userContext: ctx
    });
    if (claimValidationResponse.accessTokenPayloadUpdate !== void 0) {
      if (!await recipeImpl.mergeIntoAccessTokenPayload({
        sessionHandle,
        accessTokenPayloadUpdate: claimValidationResponse.accessTokenPayloadUpdate,
        userContext: ctx
      })) {
        return {
          status: "SESSION_DOES_NOT_EXIST_ERROR"
        };
      }
    }
    return {
      status: "OK",
      invalidClaims: claimValidationResponse.invalidClaims
    };
  }
  static async getSession(req, res, options, userContext) {
    const recipeInstance = import_recipe.default.getInstanceOrThrowError();
    const config = recipeInstance.config;
    const recipeInterfaceImpl = recipeInstance.recipeInterfaceImpl;
    return (0, import_sessionRequestFunctions.getSessionFromRequest)({
      req,
      res,
      recipeInterfaceImpl,
      config,
      options,
      userContext: (0, import_utils2.getUserContext)(userContext)
      // userContext is normalized inside the function
    });
  }
  static async getSessionWithoutRequestResponse(accessToken, antiCsrfToken, options, userContext) {
    const ctx = (0, import_utils2.getUserContext)(userContext);
    const recipeInterfaceImpl = import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl;
    const session = await recipeInterfaceImpl.getSession({
      accessToken,
      antiCsrfToken,
      options,
      userContext: ctx
    });
    if (session !== void 0) {
      const claimValidators = await (0, import_utils.getRequiredClaimValidators)(
        session,
        options == null ? void 0 : options.overrideGlobalClaimValidators,
        ctx
      );
      await session.assertClaims(claimValidators, ctx);
    }
    return session;
  }
  static getSessionInformation(sessionHandle, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.getSessionInformation({
      sessionHandle,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static refreshSession(req, res, userContext) {
    const recipeInstance = import_recipe.default.getInstanceOrThrowError();
    const config = recipeInstance.config;
    const recipeInterfaceImpl = recipeInstance.recipeInterfaceImpl;
    return (0, import_sessionRequestFunctions.refreshSessionInRequest)({
      res,
      req,
      userContext: (0, import_utils2.getUserContext)(userContext),
      config,
      recipeInterfaceImpl
    });
  }
  static refreshSessionWithoutRequestResponse(refreshToken, disableAntiCsrf = false, antiCsrfToken, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.refreshSession({
      refreshToken,
      disableAntiCsrf,
      antiCsrfToken,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static revokeAllSessionsForUser(userId, revokeSessionsForLinkedAccounts = true, tenantId, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.revokeAllSessionsForUser({
      userId,
      tenantId: tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId,
      revokeSessionsForLinkedAccounts,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static getAllSessionHandlesForUser(userId, fetchSessionsForAllLinkedAccounts = true, tenantId, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.getAllSessionHandlesForUser({
      userId,
      tenantId: tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId,
      fetchAcrossAllTenants: tenantId === void 0,
      fetchSessionsForAllLinkedAccounts,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static revokeSession(sessionHandle, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.revokeSession({
      sessionHandle,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static revokeMultipleSessions(sessionHandles, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.revokeMultipleSessions({
      sessionHandles,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static updateSessionDataInDatabase(sessionHandle, newSessionData, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.updateSessionDataInDatabase({
      sessionHandle,
      newSessionData,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static mergeIntoAccessTokenPayload(sessionHandle, accessTokenPayloadUpdate, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.mergeIntoAccessTokenPayload({
      sessionHandle,
      accessTokenPayloadUpdate,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static createJWT(payload, validitySeconds, useStaticSigningKey, userContext) {
    return import_recipe.default.getInstanceOrThrowError().openIdRecipe.recipeImplementation.createJWT({
      payload,
      validitySeconds,
      useStaticSigningKey,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static getJWKS(userContext) {
    return import_recipe.default.getInstanceOrThrowError().openIdRecipe.recipeImplementation.getJWKS({
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static getOpenIdDiscoveryConfiguration(userContext) {
    return import_recipe.default.getInstanceOrThrowError().openIdRecipe.recipeImplementation.getOpenIdDiscoveryConfiguration({
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static fetchAndSetClaim(sessionHandle, claim, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.fetchAndSetClaim({
      sessionHandle,
      claim,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static setClaimValue(sessionHandle, claim, value, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.setClaimValue({
      sessionHandle,
      claim,
      value,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static getClaimValue(sessionHandle, claim, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.getClaimValue({
      sessionHandle,
      claim,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
  static removeClaim(sessionHandle, claim, userContext) {
    return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.removeClaim({
      sessionHandle,
      claim,
      userContext: (0, import_utils2.getUserContext)(userContext)
    });
  }
}
SessionWrapper.init = import_recipe.default.init;
SessionWrapper.Error = import_error.default;
let init = SessionWrapper.init;
let createNewSession = SessionWrapper.createNewSession;
let createNewSessionWithoutRequestResponse = SessionWrapper.createNewSessionWithoutRequestResponse;
let getSession = SessionWrapper.getSession;
let getSessionWithoutRequestResponse = SessionWrapper.getSessionWithoutRequestResponse;
let getSessionInformation = SessionWrapper.getSessionInformation;
let refreshSession = SessionWrapper.refreshSession;
let refreshSessionWithoutRequestResponse = SessionWrapper.refreshSessionWithoutRequestResponse;
let revokeAllSessionsForUser = SessionWrapper.revokeAllSessionsForUser;
let getAllSessionHandlesForUser = SessionWrapper.getAllSessionHandlesForUser;
let revokeSession = SessionWrapper.revokeSession;
let revokeMultipleSessions = SessionWrapper.revokeMultipleSessions;
let updateSessionDataInDatabase = SessionWrapper.updateSessionDataInDatabase;
let mergeIntoAccessTokenPayload = SessionWrapper.mergeIntoAccessTokenPayload;
let fetchAndSetClaim = SessionWrapper.fetchAndSetClaim;
let setClaimValue = SessionWrapper.setClaimValue;
let getClaimValue = SessionWrapper.getClaimValue;
let removeClaim = SessionWrapper.removeClaim;
let validateClaimsForSessionHandle = SessionWrapper.validateClaimsForSessionHandle;
let Error2 = SessionWrapper.Error;
let createJWT = SessionWrapper.createJWT;
let getJWKS = SessionWrapper.getJWKS;
let getOpenIdDiscoveryConfiguration = SessionWrapper.getOpenIdDiscoveryConfiguration;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Error,
  createJWT,
  createNewSession,
  createNewSessionWithoutRequestResponse,
  fetchAndSetClaim,
  getAllSessionHandlesForUser,
  getClaimValue,
  getJWKS,
  getOpenIdDiscoveryConfiguration,
  getSession,
  getSessionInformation,
  getSessionWithoutRequestResponse,
  init,
  mergeIntoAccessTokenPayload,
  refreshSession,
  refreshSessionWithoutRequestResponse,
  removeClaim,
  revokeAllSessionsForUser,
  revokeMultipleSessions,
  revokeSession,
  setClaimValue,
  updateSessionDataInDatabase,
  validateClaimsForSessionHandle
});
