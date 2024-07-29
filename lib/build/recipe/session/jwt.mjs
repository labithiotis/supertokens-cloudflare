import { logDebugMessage } from "../../logger";
import { Buffer } from "node:buffer";
const HEADERS = /* @__PURE__ */ new Set([
  Buffer.from(
    JSON.stringify({
      alg: "RS256",
      typ: "JWT",
      version: "1"
    })
  ).toString("base64"),
  Buffer.from(
    JSON.stringify({
      alg: "RS256",
      typ: "JWT",
      version: "2"
    })
  ).toString("base64")
]);
function parseJWTWithoutSignatureVerification(jwt) {
  const splittedInput = jwt.split(".");
  if (splittedInput.length !== 3) {
    throw new Error("Invalid JWT");
  }
  const latestVersion = 3;
  let version = 2;
  let kid = void 0;
  if (!HEADERS.has(splittedInput[0])) {
    const parsedHeader = JSON.parse(Buffer.from(splittedInput[0], "base64").toString());
    if (parsedHeader.version !== void 0) {
      if (typeof parsedHeader.version !== "string") {
        throw new Error("JWT header mismatch");
      }
      version = Number.parseInt(parsedHeader.version);
      logDebugMessage("parseJWTWithoutSignatureVerification: version from header: " + version);
    } else {
      logDebugMessage(
        "parseJWTWithoutSignatureVerification: assuming latest version (3) because version header is missing"
      );
      version = latestVersion;
    }
    kid = parsedHeader.kid;
    if (parsedHeader.typ !== "JWT" || !Number.isInteger(version) || version < 3 || kid === void 0) {
      throw new Error("JWT header mismatch");
    }
  }
  return {
    version,
    kid,
    rawTokenString: jwt,
    rawPayload: splittedInput[1],
    header: splittedInput[0],
    // Ideally we would only parse this after the signature verification is done.
    // We do this at the start, since we want to check if a token can be a supertokens access token or not
    payload: JSON.parse(Buffer.from(splittedInput[1], "base64").toString()),
    signature: splittedInput[2]
  };
}
export {
  parseJWTWithoutSignatureVerification
};
