"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
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
var __forAwait = (obj, it, method) => (it = obj[__knownSymbol("asyncIterator")]) ? it.call(obj) : (obj = obj[__knownSymbol("iterator")](), it = {}, method = (key, fn) => (fn = obj[key]) && (it[key] = (arg) => new Promise((yes, no, done) => (arg = fn.call(obj, arg), done = arg.done, Promise.resolve(arg.value).then((value) => yes({ value, done }), no)))), method("next"), method("return"), it);
var accessToken_exports = {};
__export(accessToken_exports, {
  getInfoFromAccessToken: () => getInfoFromAccessToken,
  sanitizeNumberInput: () => sanitizeNumberInput,
  validateAccessTokenStructure: () => validateAccessTokenStructure
});
module.exports = __toCommonJS(accessToken_exports);
var import_error = __toESM(require("./error"), 1);
var jose = __toESM(require("jose"), 1);
var import_processState = require("../../processState");
var import_recipeUserId = __toESM(require("../../recipeUserId"), 1);
var import_logger = require("../../logger");
var import_constants = require("../multitenancy/constants");
async function getInfoFromAccessToken(jwtInfo, jwks, doAntiCsrfCheck) {
  var _a;
  try {
    let payload = void 0;
    try {
      payload = (await jose.jwtVerify(jwtInfo.rawTokenString, jwks)).payload;
    } catch (err) {
      const error2 = err;
      if (jwtInfo.version === 2 && (error2 == null ? void 0 : error2.code) === "ERR_JWKS_MULTIPLE_MATCHING_KEYS") {
        import_processState.ProcessState.getInstance().addState(import_processState.PROCESS_STATE.MULTI_JWKS_VALIDATION);
        try {
          for (var iter = __forAwait(error2), more, temp, error; more = !(temp = await iter.next()).done; more = false) {
            const publicKey = temp.value;
            try {
              payload = (await jose.jwtVerify(jwtInfo.rawTokenString, publicKey)).payload;
              break;
            } catch (innerError) {
              if ((innerError == null ? void 0 : innerError.code) === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED") {
                continue;
              }
              throw innerError;
            }
          }
        } catch (temp) {
          error = [temp];
        } finally {
          try {
            more && (temp = iter.return) && await temp.call(iter);
          } finally {
            if (error)
              throw error[0];
          }
        }
        if (payload === void 0) {
          throw new jose.errors.JWSSignatureVerificationFailed();
        }
      } else {
        throw error2;
      }
    }
    validateAccessTokenStructure(payload, jwtInfo.version);
    let userId = jwtInfo.version === 2 ? sanitizeStringInput(payload.userId) : sanitizeStringInput(payload.sub);
    let expiryTime = jwtInfo.version === 2 ? sanitizeNumberInput(payload.expiryTime) : sanitizeNumberInput(payload.exp) * 1e3;
    let timeCreated = jwtInfo.version === 2 ? sanitizeNumberInput(payload.timeCreated) : sanitizeNumberInput(payload.iat) * 1e3;
    let userData = jwtInfo.version === 2 ? payload.userData : payload;
    let sessionHandle = sanitizeStringInput(payload.sessionHandle);
    let recipeUserId = new import_recipeUserId.default((_a = sanitizeStringInput(payload.rsub)) != null ? _a : userId);
    let refreshTokenHash1 = sanitizeStringInput(payload.refreshTokenHash1);
    let parentRefreshTokenHash1 = sanitizeStringInput(payload.parentRefreshTokenHash1);
    let antiCsrfToken = sanitizeStringInput(payload.antiCsrfToken);
    let tenantId = import_constants.DEFAULT_TENANT_ID;
    if (jwtInfo.version >= 4) {
      tenantId = sanitizeStringInput(payload.tId);
    }
    if (antiCsrfToken === void 0 && doAntiCsrfCheck) {
      throw Error("Access token does not contain the anti-csrf token.");
    }
    if (expiryTime < Date.now()) {
      throw Error("Access token expired");
    }
    return {
      sessionHandle,
      userId,
      refreshTokenHash1,
      parentRefreshTokenHash1,
      userData,
      antiCsrfToken,
      expiryTime,
      timeCreated,
      recipeUserId,
      tenantId
    };
  } catch (err) {
    (0, import_logger.logDebugMessage)(
      "getInfoFromAccessToken: Returning TRY_REFRESH_TOKEN because access token validation failed - " + (err == null ? void 0 : err.message)
    );
    throw new import_error.default({
      message: "Failed to verify access token",
      type: import_error.default.TRY_REFRESH_TOKEN
    });
  }
}
function validateAccessTokenStructure(payload, version) {
  if (version >= 5) {
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number" || typeof payload.iat !== "number" || typeof payload.sessionHandle !== "string" || typeof payload.refreshTokenHash1 !== "string" || typeof payload.rsub !== "string") {
      (0, import_logger.logDebugMessage)("validateAccessTokenStructure: Access token is using version >= 4");
      throw Error("Access token does not contain all the information. Maybe the structure has changed?");
    }
  } else if (version >= 4) {
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number" || typeof payload.iat !== "number" || typeof payload.sessionHandle !== "string" || typeof payload.refreshTokenHash1 !== "string") {
      (0, import_logger.logDebugMessage)("validateAccessTokenStructure: Access token is using version >= 4");
      throw Error("Access token does not contain all the information. Maybe the structure has changed?");
    }
  } else if (version >= 3) {
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number" || typeof payload.iat !== "number" || typeof payload.sessionHandle !== "string" || typeof payload.refreshTokenHash1 !== "string") {
      (0, import_logger.logDebugMessage)("validateAccessTokenStructure: Access token is using version >= 3");
      throw Error("Access token does not contain all the information. Maybe the structure has changed?");
    }
    if (version >= 4) {
      if (typeof payload.tId !== "string") {
        throw Error("Access token does not contain all the information. Maybe the structure has changed?");
      }
    }
  } else if (typeof payload.sessionHandle !== "string" || typeof payload.userId !== "string" || typeof payload.refreshTokenHash1 !== "string" || payload.userData === void 0 || typeof payload.expiryTime !== "number" || typeof payload.timeCreated !== "number") {
    (0, import_logger.logDebugMessage)("validateAccessTokenStructure: Access token is using version < 3");
    throw Error("Access token does not contain all the information. Maybe the structure has changed?");
  }
}
function sanitizeStringInput(field) {
  if (field === "") {
    return "";
  }
  if (typeof field !== "string") {
    return void 0;
  }
  try {
    let result = field.trim();
    return result;
  } catch (err) {
  }
  return void 0;
}
function sanitizeNumberInput(field) {
  if (typeof field === "number") {
    return field;
  }
  return void 0;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getInfoFromAccessToken,
  sanitizeNumberInput,
  validateAccessTokenStructure
});
