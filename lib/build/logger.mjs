import debug from "debug";
import { version } from "./version";
const SUPERTOKENS_DEBUG_NAMESPACE = "com.supertokens";
function logDebugMessage(message) {
  if (debug.enabled(SUPERTOKENS_DEBUG_NAMESPACE)) {
    debug(SUPERTOKENS_DEBUG_NAMESPACE)(
      `{t: "${(/* @__PURE__ */ new Date()).toISOString()}", message: "${message}", file: "${getFileLocation()}" sdkVer: "${version}"}`
    );
    console.log();
  }
}
function enableDebugLogs() {
  debug.enable(SUPERTOKENS_DEBUG_NAMESPACE);
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
export {
  enableDebugLogs,
  logDebugMessage
};
