var __defProp = Object.defineProperty;
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
import { buildFrontToken, clearSession, setAntiCsrfTokenInHeaders, setToken } from "./cookieAndHeaders";
import STError from "./error";
import { setAccessTokenInResponse } from "./utils";
import { parseJWTWithoutSignatureVerification } from "./jwt";
import { logDebugMessage } from "../../logger";
import { protectedProps } from "./constants";
import { getUserContext, makeDefaultUserContextFromAPI } from "../../utils";
class Session {
  constructor(helpers, accessToken, frontToken, refreshToken, antiCsrfToken, sessionHandle, userId, recipeUserId, userDataInAccessToken, reqResInfo, accessTokenUpdated, tenantId) {
    this.helpers = helpers;
    this.accessToken = accessToken;
    this.frontToken = frontToken;
    this.refreshToken = refreshToken;
    this.antiCsrfToken = antiCsrfToken;
    this.sessionHandle = sessionHandle;
    this.userId = userId;
    this.recipeUserId = recipeUserId;
    this.userDataInAccessToken = userDataInAccessToken;
    this.reqResInfo = reqResInfo;
    this.accessTokenUpdated = accessTokenUpdated;
    this.tenantId = tenantId;
  }
  getRecipeUserId(_userContext) {
    return this.recipeUserId;
  }
  async revokeSession(userContext) {
    const ctx = userContext === void 0 && this.reqResInfo !== void 0 ? makeDefaultUserContextFromAPI(this.reqResInfo.req) : getUserContext(userContext);
    await this.helpers.getRecipeImpl().revokeSession({
      sessionHandle: this.sessionHandle,
      userContext: ctx
    });
    if (this.reqResInfo !== void 0) {
      clearSession(
        this.helpers.config,
        this.reqResInfo.res,
        this.reqResInfo.transferMethod,
        this.reqResInfo.req,
        ctx
      );
    }
  }
  async getSessionDataFromDatabase(userContext) {
    const ctx = userContext === void 0 && this.reqResInfo !== void 0 ? makeDefaultUserContextFromAPI(this.reqResInfo.req) : getUserContext(userContext);
    let sessionInfo = await this.helpers.getRecipeImpl().getSessionInformation({
      sessionHandle: this.sessionHandle,
      userContext: ctx
    });
    if (sessionInfo === void 0) {
      logDebugMessage("getSessionDataFromDatabase: Throwing UNAUTHORISED because session does not exist anymore");
      throw new STError({
        message: "Session does not exist anymore",
        type: STError.UNAUTHORISED
      });
    }
    return sessionInfo.sessionDataInDatabase;
  }
  async updateSessionDataInDatabase(newSessionData, userContext) {
    const ctx = userContext === void 0 && this.reqResInfo !== void 0 ? makeDefaultUserContextFromAPI(this.reqResInfo.req) : getUserContext(userContext);
    if (!await this.helpers.getRecipeImpl().updateSessionDataInDatabase({
      sessionHandle: this.sessionHandle,
      newSessionData,
      userContext: ctx
    })) {
      logDebugMessage(
        "updateSessionDataInDatabase: Throwing UNAUTHORISED because session does not exist anymore"
      );
      throw new STError({
        message: "Session does not exist anymore",
        type: STError.UNAUTHORISED
      });
    }
  }
  getUserId(_userContext) {
    return this.userId;
  }
  getTenantId(_userContext) {
    return this.tenantId;
  }
  getAccessTokenPayload(_userContext) {
    return this.userDataInAccessToken;
  }
  getHandle() {
    return this.sessionHandle;
  }
  getAccessToken() {
    return this.accessToken;
  }
  getAllSessionTokensDangerously() {
    var _a;
    return {
      accessToken: this.accessToken,
      accessAndFrontTokenUpdated: this.accessTokenUpdated,
      refreshToken: (_a = this.refreshToken) == null ? void 0 : _a.token,
      frontToken: this.frontToken,
      antiCsrfToken: this.antiCsrfToken
    };
  }
  // Any update to this function should also be reflected in the respective JWT version
  async mergeIntoAccessTokenPayload(accessTokenPayloadUpdate, userContext) {
    const ctx = userContext === void 0 && this.reqResInfo !== void 0 ? makeDefaultUserContextFromAPI(this.reqResInfo.req) : getUserContext(userContext);
    let newAccessTokenPayload = __spreadValues({}, this.getAccessTokenPayload(ctx));
    for (const key of protectedProps) {
      delete newAccessTokenPayload[key];
    }
    newAccessTokenPayload = __spreadValues(__spreadValues({}, newAccessTokenPayload), accessTokenPayloadUpdate);
    for (const key of Object.keys(accessTokenPayloadUpdate)) {
      if (accessTokenPayloadUpdate[key] === null) {
        delete newAccessTokenPayload[key];
      }
    }
    let response = await this.helpers.getRecipeImpl().regenerateAccessToken({
      accessToken: this.getAccessToken(),
      newAccessTokenPayload,
      userContext: ctx
    });
    if (response === void 0) {
      logDebugMessage(
        "mergeIntoAccessTokenPayload: Throwing UNAUTHORISED because session does not exist anymore"
      );
      throw new STError({
        message: "Session does not exist anymore",
        type: STError.UNAUTHORISED
      });
    }
    if (response.accessToken !== void 0) {
      const respToken = parseJWTWithoutSignatureVerification(response.accessToken.token);
      const payload = respToken.version < 3 ? response.session.userDataInJWT : respToken.payload;
      this.userDataInAccessToken = payload;
      this.accessToken = response.accessToken.token;
      this.frontToken = buildFrontToken(this.userId, response.accessToken.expiry, payload);
      this.accessTokenUpdated = true;
      if (this.reqResInfo !== void 0) {
        setAccessTokenInResponse(
          this.reqResInfo.res,
          this.accessToken,
          this.frontToken,
          this.helpers.config,
          this.reqResInfo.transferMethod,
          this.reqResInfo.req,
          ctx
        );
      }
    } else {
      this.userDataInAccessToken = __spreadValues(__spreadValues({}, this.getAccessTokenPayload(ctx)), response.session.userDataInJWT);
    }
  }
  async getTimeCreated(userContext) {
    const ctx = userContext === void 0 && this.reqResInfo !== void 0 ? makeDefaultUserContextFromAPI(this.reqResInfo.req) : getUserContext(userContext);
    let sessionInfo = await this.helpers.getRecipeImpl().getSessionInformation({
      sessionHandle: this.sessionHandle,
      userContext: ctx
    });
    if (sessionInfo === void 0) {
      logDebugMessage("getTimeCreated: Throwing UNAUTHORISED because session does not exist anymore");
      throw new STError({
        message: "Session does not exist anymore",
        type: STError.UNAUTHORISED
      });
    }
    return sessionInfo.timeCreated;
  }
  async getExpiry(userContext) {
    const ctx = userContext === void 0 && this.reqResInfo !== void 0 ? makeDefaultUserContextFromAPI(this.reqResInfo.req) : getUserContext(userContext);
    let sessionInfo = await this.helpers.getRecipeImpl().getSessionInformation({
      sessionHandle: this.sessionHandle,
      userContext: ctx
    });
    if (sessionInfo === void 0) {
      logDebugMessage("getExpiry: Throwing UNAUTHORISED because session does not exist anymore");
      throw new STError({
        message: "Session does not exist anymore",
        type: STError.UNAUTHORISED
      });
    }
    return sessionInfo.expiry;
  }
  // Any update to this function should also be reflected in the respective JWT version
  async assertClaims(claimValidators, userContext) {
    const ctx = userContext === void 0 && this.reqResInfo !== void 0 ? makeDefaultUserContextFromAPI(this.reqResInfo.req) : getUserContext(userContext);
    let validateClaimResponse = await this.helpers.getRecipeImpl().validateClaims({
      accessTokenPayload: this.getAccessTokenPayload(ctx),
      userId: this.getUserId(ctx),
      recipeUserId: this.getRecipeUserId(ctx),
      claimValidators,
      userContext: ctx
    });
    if (validateClaimResponse.accessTokenPayloadUpdate !== void 0) {
      for (const key of protectedProps) {
        delete validateClaimResponse.accessTokenPayloadUpdate[key];
      }
      await this.mergeIntoAccessTokenPayload(validateClaimResponse.accessTokenPayloadUpdate, ctx);
    }
    if (validateClaimResponse.invalidClaims.length !== 0) {
      throw new STError({
        type: "INVALID_CLAIMS",
        message: "INVALID_CLAIMS",
        payload: validateClaimResponse.invalidClaims
      });
    }
  }
  // Any update to this function should also be reflected in the respective JWT version
  async fetchAndSetClaim(claim, userContext) {
    const ctx = userContext === void 0 && this.reqResInfo !== void 0 ? makeDefaultUserContextFromAPI(this.reqResInfo.req) : getUserContext(userContext);
    const update = await claim.build(
      this.getUserId(ctx),
      this.getRecipeUserId(ctx),
      this.getTenantId(ctx),
      this.getAccessTokenPayload(ctx),
      ctx
    );
    return this.mergeIntoAccessTokenPayload(update, ctx);
  }
  // Any update to this function should also be reflected in the respective JWT version
  setClaimValue(claim, value, userContext) {
    const ctx = userContext === void 0 && this.reqResInfo !== void 0 ? makeDefaultUserContextFromAPI(this.reqResInfo.req) : getUserContext(userContext);
    const update = claim.addToPayload_internal({}, value, getUserContext(ctx));
    return this.mergeIntoAccessTokenPayload(update, ctx);
  }
  // Any update to this function should also be reflected in the respective JWT version
  async getClaimValue(claim, userContext) {
    const ctx = userContext === void 0 && this.reqResInfo !== void 0 ? makeDefaultUserContextFromAPI(this.reqResInfo.req) : getUserContext(userContext);
    return claim.getValueFromPayload(await this.getAccessTokenPayload(ctx), ctx);
  }
  // Any update to this function should also be reflected in the respective JWT version
  removeClaim(claim, userContext) {
    const ctx = userContext === void 0 && this.reqResInfo !== void 0 ? makeDefaultUserContextFromAPI(this.reqResInfo.req) : getUserContext(userContext);
    const update = claim.removeFromPayloadByMerge_internal({}, ctx);
    return this.mergeIntoAccessTokenPayload(update, ctx);
  }
  attachToRequestResponse(info, userContext) {
    this.reqResInfo = info;
    if (this.accessTokenUpdated) {
      const { res, transferMethod } = info;
      const ctx = userContext === void 0 && this.reqResInfo !== void 0 ? makeDefaultUserContextFromAPI(this.reqResInfo.req) : getUserContext(userContext);
      setAccessTokenInResponse(
        res,
        this.accessToken,
        this.frontToken,
        this.helpers.config,
        transferMethod,
        info.req,
        ctx
      );
      if (this.refreshToken !== void 0) {
        setToken(
          this.helpers.config,
          res,
          "refresh",
          this.refreshToken.token,
          this.refreshToken.expiry,
          transferMethod,
          info.req,
          ctx
        );
      }
      if (this.antiCsrfToken !== void 0) {
        setAntiCsrfTokenInHeaders(res, this.antiCsrfToken);
      }
    }
  }
}
export {
  Session as default
};
