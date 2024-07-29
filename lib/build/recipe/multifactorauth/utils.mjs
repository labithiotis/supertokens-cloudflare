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
import Multitenancy from "../multitenancy";
import { getUser } from "../..";
import Recipe from "./recipe";
import { MultiFactorAuthClaim } from "./multiFactorAuthClaim";
import Session from "../session";
import SessionError from "../session/error";
import { FactorIds } from "./types";
import { isValidFirstFactor } from "../multitenancy/utils";
function validateAndNormaliseUserInput(config) {
  if ((config == null ? void 0 : config.firstFactors) !== void 0 && (config == null ? void 0 : config.firstFactors.length) === 0) {
    throw new Error("'firstFactors' can be either undefined or a non-empty array");
  }
  let override = __spreadValues({
    functions: (originalImplementation) => originalImplementation,
    apis: (originalImplementation) => originalImplementation
  }, config == null ? void 0 : config.override);
  return {
    firstFactors: config == null ? void 0 : config.firstFactors,
    override
  };
}
const updateAndGetMFARelatedInfoInSession = async function(input) {
  let sessionRecipeUserId;
  let tenantId;
  let accessTokenPayload;
  let sessionHandle;
  if ("session" in input) {
    sessionRecipeUserId = input.session.getRecipeUserId(input.userContext);
    tenantId = input.session.getTenantId(input.userContext);
    accessTokenPayload = input.session.getAccessTokenPayload(input.userContext);
    sessionHandle = input.session.getHandle(input.userContext);
  } else {
    sessionRecipeUserId = input.sessionRecipeUserId;
    tenantId = input.tenantId;
    accessTokenPayload = input.accessTokenPayload;
    sessionHandle = accessTokenPayload.sessionHandle;
  }
  let updatedClaimVal = false;
  let mfaClaimValue = MultiFactorAuthClaim.getValueFromPayload(accessTokenPayload);
  if (input.updatedFactorId) {
    if (mfaClaimValue === void 0) {
      updatedClaimVal = true;
      mfaClaimValue = {
        c: {
          [input.updatedFactorId]: Math.floor(Date.now() / 1e3)
        },
        v: true
        // updated later in the function
      };
    } else {
      updatedClaimVal = true;
      mfaClaimValue.c[input.updatedFactorId] = Math.floor(Date.now() / 1e3);
    }
  }
  if (mfaClaimValue === void 0) {
    const sessionUser = await getUser(sessionRecipeUserId.getAsString(), input.userContext);
    if (sessionUser === void 0) {
      throw new SessionError({
        type: SessionError.UNAUTHORISED,
        message: "Session user not found"
      });
    }
    const sessionInfo = await Session.getSessionInformation(sessionHandle, input.userContext);
    if (sessionInfo === void 0) {
      throw new SessionError({
        type: SessionError.UNAUTHORISED,
        message: "Session not found"
      });
    }
    const firstFactorTime = sessionInfo.timeCreated;
    let computedFirstFactorIdForSession = void 0;
    for (const lM of sessionUser.loginMethods) {
      if (lM.recipeUserId.getAsString() === sessionRecipeUserId.getAsString()) {
        if (lM.recipeId === "emailpassword") {
          let validRes = await isValidFirstFactor(tenantId, FactorIds.EMAILPASSWORD, input.userContext);
          if (validRes.status === "TENANT_NOT_FOUND_ERROR") {
            throw new SessionError({
              type: SessionError.UNAUTHORISED,
              message: "Tenant not found"
            });
          } else if (validRes.status === "OK") {
            computedFirstFactorIdForSession = FactorIds.EMAILPASSWORD;
            break;
          }
        } else if (lM.recipeId === "thirdparty") {
          let validRes = await isValidFirstFactor(tenantId, FactorIds.THIRDPARTY, input.userContext);
          if (validRes.status === "TENANT_NOT_FOUND_ERROR") {
            throw new SessionError({
              type: SessionError.UNAUTHORISED,
              message: "Tenant not found"
            });
          } else if (validRes.status === "OK") {
            computedFirstFactorIdForSession = FactorIds.THIRDPARTY;
            break;
          }
        } else {
          let factorsToCheck = [];
          if (lM.email !== void 0) {
            factorsToCheck.push(FactorIds.LINK_EMAIL);
            factorsToCheck.push(FactorIds.OTP_EMAIL);
          }
          if (lM.phoneNumber !== void 0) {
            factorsToCheck.push(FactorIds.LINK_PHONE);
            factorsToCheck.push(FactorIds.OTP_PHONE);
          }
          for (const factorId of factorsToCheck) {
            let validRes = await isValidFirstFactor(tenantId, factorId, input.userContext);
            if (validRes.status === "TENANT_NOT_FOUND_ERROR") {
              throw new SessionError({
                type: SessionError.UNAUTHORISED,
                message: "Tenant not found"
              });
            } else if (validRes.status === "OK") {
              computedFirstFactorIdForSession = factorId;
              break;
            }
          }
          if (computedFirstFactorIdForSession !== void 0) {
            break;
          }
        }
      }
    }
    if (computedFirstFactorIdForSession === void 0) {
      throw new SessionError({
        type: SessionError.UNAUTHORISED,
        message: "Incorrect login method used"
      });
    }
    updatedClaimVal = true;
    mfaClaimValue = {
      c: {
        [computedFirstFactorIdForSession]: firstFactorTime
      },
      v: true
      // updated later in this function
    };
  }
  const completedFactors = mfaClaimValue.c;
  let userProm;
  function userGetter() {
    if (userProm) {
      return userProm;
    }
    userProm = getUser(sessionRecipeUserId.getAsString(), input.userContext).then((sessionUser) => {
      if (sessionUser === void 0) {
        throw new SessionError({
          type: SessionError.UNAUTHORISED,
          message: "Session user not found"
        });
      }
      return sessionUser;
    });
    return userProm;
  }
  const mfaRequirementsForAuth = await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getMFARequirementsForAuth(
    {
      accessTokenPayload,
      tenantId,
      get user() {
        return userGetter();
      },
      get factorsSetUpForUser() {
        return userGetter().then(
          (user) => Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getFactorsSetupForUser({
            user,
            userContext: input.userContext
          })
        );
      },
      get requiredSecondaryFactorsForUser() {
        return userGetter().then((sessionUser) => {
          if (sessionUser === void 0) {
            throw new SessionError({
              type: SessionError.UNAUTHORISED,
              message: "Session user not found"
            });
          }
          return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getRequiredSecondaryFactorsForUser({
            userId: sessionUser.id,
            userContext: input.userContext
          });
        });
      },
      get requiredSecondaryFactorsForTenant() {
        return Multitenancy.getTenant(tenantId, input.userContext).then((tenantInfo) => {
          var _a;
          if (tenantInfo === void 0) {
            throw new SessionError({
              type: SessionError.UNAUTHORISED,
              message: "Tenant not found"
            });
          }
          return (_a = tenantInfo.requiredSecondaryFactors) != null ? _a : [];
        });
      },
      completedFactors,
      userContext: input.userContext
    }
  );
  const areAuthReqsComplete = MultiFactorAuthClaim.getNextSetOfUnsatisfiedFactors(completedFactors, mfaRequirementsForAuth).factorIds.length === 0;
  if (mfaClaimValue.v !== areAuthReqsComplete) {
    updatedClaimVal = true;
    mfaClaimValue.v = areAuthReqsComplete;
  }
  if ("session" in input && updatedClaimVal) {
    await input.session.setClaimValue(MultiFactorAuthClaim, mfaClaimValue, input.userContext);
  }
  return {
    completedFactors,
    mfaRequirementsForAuth,
    isMFARequirementsForAuthSatisfied: mfaClaimValue.v
  };
};
export {
  updateAndGetMFARelatedInfoInSession,
  validateAndNormaliseUserInput
};
