var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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
import SuperTokensError from "./error";
import Recipe from "./recipe";
import { getRequiredClaimValidators } from "./utils";
import { createNewSessionInRequest, getSessionFromRequest, refreshSessionInRequest } from "./sessionRequestFunctions";
import { getUser } from "../..";
import { DEFAULT_TENANT_ID } from "../multitenancy/constants";
import { protectedProps } from "./constants";
import { getUserContext } from "../../utils";
class SessionWrapper {
  static async createNewSession(req, res, tenantId, recipeUserId, accessTokenPayload = {}, sessionDataInDatabase = {}, userContext) {
    const recipeInstance = Recipe.getInstanceOrThrowError();
    const config = recipeInstance.config;
    const appInfo = recipeInstance.getAppInfo();
    let user = await getUser(recipeUserId.getAsString(), userContext);
    let userId = recipeUserId.getAsString();
    if (user !== void 0) {
      userId = user.id;
    }
    return await createNewSessionInRequest({
      req,
      res,
      userContext: getUserContext(userContext),
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
    const ctx = getUserContext(userContext);
    const recipeInstance = Recipe.getInstanceOrThrowError();
    const claimsAddedByOtherRecipes = recipeInstance.getClaimsAddedByOtherRecipes();
    const appInfo = recipeInstance.getAppInfo();
    const issuer = appInfo.apiDomain.getAsStringDangerous() + appInfo.apiBasePath.getAsStringDangerous();
    let finalAccessTokenPayload = __spreadProps(__spreadValues({}, accessTokenPayload), {
      iss: issuer
    });
    for (const prop of protectedProps) {
      delete finalAccessTokenPayload[prop];
    }
    let user = await getUser(recipeUserId.getAsString(), ctx);
    let userId = recipeUserId.getAsString();
    if (user !== void 0) {
      userId = user.id;
    }
    for (const claim of claimsAddedByOtherRecipes) {
      const update = await claim.build(userId, recipeUserId, tenantId, finalAccessTokenPayload, ctx);
      finalAccessTokenPayload = __spreadValues(__spreadValues({}, finalAccessTokenPayload), update);
    }
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.createNewSession({
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
    const ctx = getUserContext(userContext);
    const recipeImpl = Recipe.getInstanceOrThrowError().recipeInterfaceImpl;
    const sessionInfo = await recipeImpl.getSessionInformation({
      sessionHandle,
      userContext: ctx
    });
    if (sessionInfo === void 0) {
      return {
        status: "SESSION_DOES_NOT_EXIST_ERROR"
      };
    }
    const claimValidatorsAddedByOtherRecipes = Recipe.getInstanceOrThrowError().getClaimValidatorsAddedByOtherRecipes();
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
    const recipeInstance = Recipe.getInstanceOrThrowError();
    const config = recipeInstance.config;
    const recipeInterfaceImpl = recipeInstance.recipeInterfaceImpl;
    return getSessionFromRequest({
      req,
      res,
      recipeInterfaceImpl,
      config,
      options,
      userContext: getUserContext(userContext)
      // userContext is normalized inside the function
    });
  }
  static async getSessionWithoutRequestResponse(accessToken, antiCsrfToken, options, userContext) {
    const ctx = getUserContext(userContext);
    const recipeInterfaceImpl = Recipe.getInstanceOrThrowError().recipeInterfaceImpl;
    const session = await recipeInterfaceImpl.getSession({
      accessToken,
      antiCsrfToken,
      options,
      userContext: ctx
    });
    if (session !== void 0) {
      const claimValidators = await getRequiredClaimValidators(
        session,
        options == null ? void 0 : options.overrideGlobalClaimValidators,
        ctx
      );
      await session.assertClaims(claimValidators, ctx);
    }
    return session;
  }
  static getSessionInformation(sessionHandle, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getSessionInformation({
      sessionHandle,
      userContext: getUserContext(userContext)
    });
  }
  static refreshSession(req, res, userContext) {
    const recipeInstance = Recipe.getInstanceOrThrowError();
    const config = recipeInstance.config;
    const recipeInterfaceImpl = recipeInstance.recipeInterfaceImpl;
    return refreshSessionInRequest({
      res,
      req,
      userContext: getUserContext(userContext),
      config,
      recipeInterfaceImpl
    });
  }
  static refreshSessionWithoutRequestResponse(refreshToken, disableAntiCsrf = false, antiCsrfToken, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.refreshSession({
      refreshToken,
      disableAntiCsrf,
      antiCsrfToken,
      userContext: getUserContext(userContext)
    });
  }
  static revokeAllSessionsForUser(userId, revokeSessionsForLinkedAccounts = true, tenantId, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.revokeAllSessionsForUser({
      userId,
      tenantId: tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId,
      revokeSessionsForLinkedAccounts,
      userContext: getUserContext(userContext)
    });
  }
  static getAllSessionHandlesForUser(userId, fetchSessionsForAllLinkedAccounts = true, tenantId, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getAllSessionHandlesForUser({
      userId,
      tenantId: tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId,
      fetchAcrossAllTenants: tenantId === void 0,
      fetchSessionsForAllLinkedAccounts,
      userContext: getUserContext(userContext)
    });
  }
  static revokeSession(sessionHandle, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.revokeSession({
      sessionHandle,
      userContext: getUserContext(userContext)
    });
  }
  static revokeMultipleSessions(sessionHandles, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.revokeMultipleSessions({
      sessionHandles,
      userContext: getUserContext(userContext)
    });
  }
  static updateSessionDataInDatabase(sessionHandle, newSessionData, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.updateSessionDataInDatabase({
      sessionHandle,
      newSessionData,
      userContext: getUserContext(userContext)
    });
  }
  static mergeIntoAccessTokenPayload(sessionHandle, accessTokenPayloadUpdate, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.mergeIntoAccessTokenPayload({
      sessionHandle,
      accessTokenPayloadUpdate,
      userContext: getUserContext(userContext)
    });
  }
  static createJWT(payload, validitySeconds, useStaticSigningKey, userContext) {
    return Recipe.getInstanceOrThrowError().openIdRecipe.recipeImplementation.createJWT({
      payload,
      validitySeconds,
      useStaticSigningKey,
      userContext: getUserContext(userContext)
    });
  }
  static getJWKS(userContext) {
    return Recipe.getInstanceOrThrowError().openIdRecipe.recipeImplementation.getJWKS({
      userContext: getUserContext(userContext)
    });
  }
  static getOpenIdDiscoveryConfiguration(userContext) {
    return Recipe.getInstanceOrThrowError().openIdRecipe.recipeImplementation.getOpenIdDiscoveryConfiguration({
      userContext: getUserContext(userContext)
    });
  }
  static fetchAndSetClaim(sessionHandle, claim, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.fetchAndSetClaim({
      sessionHandle,
      claim,
      userContext: getUserContext(userContext)
    });
  }
  static setClaimValue(sessionHandle, claim, value, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.setClaimValue({
      sessionHandle,
      claim,
      value,
      userContext: getUserContext(userContext)
    });
  }
  static getClaimValue(sessionHandle, claim, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getClaimValue({
      sessionHandle,
      claim,
      userContext: getUserContext(userContext)
    });
  }
  static removeClaim(sessionHandle, claim, userContext) {
    return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.removeClaim({
      sessionHandle,
      claim,
      userContext: getUserContext(userContext)
    });
  }
}
SessionWrapper.init = Recipe.init;
SessionWrapper.Error = SuperTokensError;
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
export {
  Error2 as Error,
  createJWT,
  createNewSession,
  createNewSessionWithoutRequestResponse,
  SessionWrapper as default,
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
};
