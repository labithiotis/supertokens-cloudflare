"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var logger_exports = {};
__export(logger_exports, {
  enableDebugLogs: () => enableDebugLogs,
  logDebugMessage: () => logDebugMessage
});
module.exports = __toCommonJS(logger_exports);
var import_debug = __toESM(require("debug"), 1);
var import_version = require("./version");
const SUPERTOKENS_DEBUG_NAMESPACE = "com.supertokens";
function logDebugMessage(message) {
  if (import_debug.default.enabled(SUPERTOKENS_DEBUG_NAMESPACE)) {
    (0, import_debug.default)(SUPERTOKENS_DEBUG_NAMESPACE)(
      `{t: "${(/* @__PURE__ */ new Date()).toISOString()}", message: "${message}", file: "${getFileLocation()}" sdkVer: "${import_version.version}"}`
    );
    console.log();
  }
}
function enableDebugLogs() {
  import_debug.default.enable(SUPERTOKENS_DEBUG_NAMESPACE);
}
let getFileLocation = () => {
  let errorObject = new Error();
  if (errorObject.stack === void 0) {
    return "N/A";
  }
  let errorStack = errorObject.stack.split("\n");
  for (let i = 1; i < errorStack.length; i++) {
    if (!errorStack[i].includes("logger.js")) {
      return errorStack[i].match(new RegExp("(?<=\\().+?(?=\\))", "g"));
    }
  }
  return "N/A";
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  enableDebugLogs,
  logDebugMessage
});
