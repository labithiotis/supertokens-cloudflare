"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var jwt_exports = {};
__export(jwt_exports, {
  parseJWTWithoutSignatureVerification: () => parseJWTWithoutSignatureVerification
});
module.exports = __toCommonJS(jwt_exports);
var import_logger = require("../../logger");
var import_node_buffer = require("node:buffer");
const HEADERS = /* @__PURE__ */ new Set([
  import_node_buffer.Buffer.from(
    JSON.stringify({
      alg: "RS256",
      typ: "JWT",
      version: "1"
    })
  ).toString("base64"),
  import_node_buffer.Buffer.from(
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
    const parsedHeader = JSON.parse(import_node_buffer.Buffer.from(splittedInput[0], "base64").toString());
    if (parsedHeader.version !== void 0) {
      if (typeof parsedHeader.version !== "string") {
        throw new Error("JWT header mismatch");
      }
      version = Number.parseInt(parsedHeader.version);
      (0, import_logger.logDebugMessage)("parseJWTWithoutSignatureVerification: version from header: " + version);
    } else {
      (0, import_logger.logDebugMessage)(
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
    payload: JSON.parse(import_node_buffer.Buffer.from(splittedInput[1], "base64").toString()),
    signature: splittedInput[2]
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseJWTWithoutSignatureVerification
});
