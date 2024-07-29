"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
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
var utils_exports = {};
__export(utils_exports, {
  updateAndGetMFARelatedInfoInSession: () => updateAndGetMFARelatedInfoInSession,
  validateAndNormaliseUserInput: () => validateAndNormaliseUserInput
});
module.exports = __toCommonJS(utils_exports);
var import_multitenancy = __toESM(require("../multitenancy"), 1);
var import__ = require("../..");
var import_recipe = __toESM(require("./recipe"), 1);
var import_multiFactorAuthClaim = require("./multiFactorAuthClaim");
var import_session = __toESM(require("../session"), 1);
var import_error = __toESM(require("../session/error"), 1);
var import_types = require("./types");
var import_utils = require("../multitenancy/utils");
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
  let mfaClaimValue = import_multiFactorAuthClaim.MultiFactorAuthClaim.getValueFromPayload(accessTokenPayload);
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
    const sessionUser = await (0, import__.getUser)(sessionRecipeUserId.getAsString(), input.userContext);
    if (sessionUser === void 0) {
      throw new import_error.default({
        type: import_error.default.UNAUTHORISED,
        message: "Session user not found"
      });
    }
    const sessionInfo = await import_session.default.getSessionInformation(sessionHandle, input.userContext);
    if (sessionInfo === void 0) {
      throw new import_error.default({
        type: import_error.default.UNAUTHORISED,
        message: "Session not found"
      });
    }
    const firstFactorTime = sessionInfo.timeCreated;
    let computedFirstFactorIdForSession = void 0;
    for (const lM of sessionUser.loginMethods) {
      if (lM.recipeUserId.getAsString() === sessionRecipeUserId.getAsString()) {
        if (lM.recipeId === "emailpassword") {
          let validRes = await (0, import_utils.isValidFirstFactor)(tenantId, import_types.FactorIds.EMAILPASSWORD, input.userContext);
          if (validRes.status === "TENANT_NOT_FOUND_ERROR") {
            throw new import_error.default({
              type: import_error.default.UNAUTHORISED,
              message: "Tenant not found"
            });
          } else if (validRes.status === "OK") {
            computedFirstFactorIdForSession = import_types.FactorIds.EMAILPASSWORD;
            break;
          }
        } else if (lM.recipeId === "thirdparty") {
          let validRes = await (0, import_utils.isValidFirstFactor)(tenantId, import_types.FactorIds.THIRDPARTY, input.userContext);
          if (validRes.status === "TENANT_NOT_FOUND_ERROR") {
            throw new import_error.default({
              type: import_error.default.UNAUTHORISED,
              message: "Tenant not found"
            });
          } else if (validRes.status === "OK") {
            computedFirstFactorIdForSession = import_types.FactorIds.THIRDPARTY;
            break;
          }
        } else {
          let factorsToCheck = [];
          if (lM.email !== void 0) {
            factorsToCheck.push(import_types.FactorIds.LINK_EMAIL);
            factorsToCheck.push(import_types.FactorIds.OTP_EMAIL);
          }
          if (lM.phoneNumber !== void 0) {
            factorsToCheck.push(import_types.FactorIds.LINK_PHONE);
            factorsToCheck.push(import_types.FactorIds.OTP_PHONE);
          }
          for (const factorId of factorsToCheck) {
            let validRes = await (0, import_utils.isValidFirstFactor)(tenantId, factorId, input.userContext);
            if (validRes.status === "TENANT_NOT_FOUND_ERROR") {
              throw new import_error.default({
                type: import_error.default.UNAUTHORISED,
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
      throw new import_error.default({
        type: import_error.default.UNAUTHORISED,
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
    userProm = (0, import__.getUser)(sessionRecipeUserId.getAsString(), input.userContext).then((sessionUser) => {
      if (sessionUser === void 0) {
        throw new import_error.default({
          type: import_error.default.UNAUTHORISED,
          message: "Session user not found"
        });
      }
      return sessionUser;
    });
    return userProm;
  }
  const mfaRequirementsForAuth = await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.getMFARequirementsForAuth(
    {
      accessTokenPayload,
      tenantId,
      get user() {
        return userGetter();
      },
      get factorsSetUpForUser() {
        return userGetter().then(
          (user) => import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.getFactorsSetupForUser({
            user,
            userContext: input.userContext
          })
        );
      },
      get requiredSecondaryFactorsForUser() {
        return userGetter().then((sessionUser) => {
          if (sessionUser === void 0) {
            throw new import_error.default({
              type: import_error.default.UNAUTHORISED,
              message: "Session user not found"
            });
          }
          return import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.getRequiredSecondaryFactorsForUser({
            userId: sessionUser.id,
            userContext: input.userContext
          });
        });
      },
      get requiredSecondaryFactorsForTenant() {
        return import_multitenancy.default.getTenant(tenantId, input.userContext).then((tenantInfo) => {
          var _a;
          if (tenantInfo === void 0) {
            throw new import_error.default({
              type: import_error.default.UNAUTHORISED,
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
  const areAuthReqsComplete = import_multiFactorAuthClaim.MultiFactorAuthClaim.getNextSetOfUnsatisfiedFactors(completedFactors, mfaRequirementsForAuth).factorIds.length === 0;
  if (mfaClaimValue.v !== areAuthReqsComplete) {
    updatedClaimVal = true;
    mfaClaimValue.v = areAuthReqsComplete;
  }
  if ("session" in input && updatedClaimVal) {
    await input.session.setClaimValue(import_multiFactorAuthClaim.MultiFactorAuthClaim, mfaClaimValue, input.userContext);
  }
  return {
    completedFactors,
    mfaRequirementsForAuth,
    isMFARequirementsForAuthSatisfied: mfaClaimValue.v
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateAndGetMFARelatedInfoInSession,
  validateAndNormaliseUserInput
});
