var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __forAwait = (obj, it, method) => (it = obj[__knownSymbol("asyncIterator")]) ? it.call(obj) : (obj = obj[__knownSymbol("iterator")](), it = {}, method = (key, fn) => (fn = obj[key]) && (it[key] = (arg) => new Promise((yes, no, done) => (arg = fn.call(obj, arg), done = arg.done, Promise.resolve(arg.value).then((value) => yes({ value, done }), no)))), method("next"), method("return"), it);
import STError from "./error";
import * as jose from "jose";
import { ProcessState, PROCESS_STATE } from "../../processState";
import RecipeUserId from "../../recipeUserId";
import { logDebugMessage } from "../../logger";
import { DEFAULT_TENANT_ID } from "../multitenancy/constants";
async function getInfoFromAccessToken(jwtInfo, jwks, doAntiCsrfCheck) {
  var _a;
  try {
    let payload = void 0;
    try {
      payload = (await jose.jwtVerify(jwtInfo.rawTokenString, jwks)).payload;
    } catch (err) {
      const error2 = err;
      if (jwtInfo.version === 2 && (error2 == null ? void 0 : error2.code) === "ERR_JWKS_MULTIPLE_MATCHING_KEYS") {
        ProcessState.getInstance().addState(PROCESS_STATE.MULTI_JWKS_VALIDATION);
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
    let recipeUserId = new RecipeUserId((_a = sanitizeStringInput(payload.rsub)) != null ? _a : userId);
    let refreshTokenHash1 = sanitizeStringInput(payload.refreshTokenHash1);
    let parentRefreshTokenHash1 = sanitizeStringInput(payload.parentRefreshTokenHash1);
    let antiCsrfToken = sanitizeStringInput(payload.antiCsrfToken);
    let tenantId = DEFAULT_TENANT_ID;
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
    logDebugMessage(
      "getInfoFromAccessToken: Returning TRY_REFRESH_TOKEN because access token validation failed - " + (err == null ? void 0 : err.message)
    );
    throw new STError({
      message: "Failed to verify access token",
      type: STError.TRY_REFRESH_TOKEN
    });
  }
}
function validateAccessTokenStructure(payload, version) {
  if (version >= 5) {
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number" || typeof payload.iat !== "number" || typeof payload.sessionHandle !== "string" || typeof payload.refreshTokenHash1 !== "string" || typeof payload.rsub !== "string") {
      logDebugMessage("validateAccessTokenStructure: Access token is using version >= 4");
      throw Error("Access token does not contain all the information. Maybe the structure has changed?");
    }
  } else if (version >= 4) {
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number" || typeof payload.iat !== "number" || typeof payload.sessionHandle !== "string" || typeof payload.refreshTokenHash1 !== "string") {
      logDebugMessage("validateAccessTokenStructure: Access token is using version >= 4");
      throw Error("Access token does not contain all the information. Maybe the structure has changed?");
    }
  } else if (version >= 3) {
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number" || typeof payload.iat !== "number" || typeof payload.sessionHandle !== "string" || typeof payload.refreshTokenHash1 !== "string") {
      logDebugMessage("validateAccessTokenStructure: Access token is using version >= 3");
      throw Error("Access token does not contain all the information. Maybe the structure has changed?");
    }
    if (version >= 4) {
      if (typeof payload.tId !== "string") {
        throw Error("Access token does not contain all the information. Maybe the structure has changed?");
      }
    }
  } else if (typeof payload.sessionHandle !== "string" || typeof payload.userId !== "string" || typeof payload.refreshTokenHash1 !== "string" || payload.userData === void 0 || typeof payload.expiryTime !== "number" || typeof payload.timeCreated !== "number") {
    logDebugMessage("validateAccessTokenStructure: Access token is using version < 3");
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
export {
  getInfoFromAccessToken,
  sanitizeNumberInput,
  validateAccessTokenStructure
};
