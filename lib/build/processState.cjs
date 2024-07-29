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
var processState_exports = {};
__export(processState_exports, {
  PROCESS_STATE: () => PROCESS_STATE,
  ProcessState: () => ProcessState
});
module.exports = __toCommonJS(processState_exports);
var import_node_process = require("node:process");
var PROCESS_STATE = /* @__PURE__ */ ((PROCESS_STATE2) => {
  PROCESS_STATE2[PROCESS_STATE2["CALLING_SERVICE_IN_VERIFY"] = 0] = "CALLING_SERVICE_IN_VERIFY";
  PROCESS_STATE2[PROCESS_STATE2["CALLING_SERVICE_IN_GET_API_VERSION"] = 1] = "CALLING_SERVICE_IN_GET_API_VERSION";
  PROCESS_STATE2[PROCESS_STATE2["CALLING_SERVICE_IN_REQUEST_HELPER"] = 2] = "CALLING_SERVICE_IN_REQUEST_HELPER";
  PROCESS_STATE2[PROCESS_STATE2["MULTI_JWKS_VALIDATION"] = 3] = "MULTI_JWKS_VALIDATION";
  PROCESS_STATE2[PROCESS_STATE2["IS_SIGN_IN_UP_ALLOWED_NO_PRIMARY_USER_EXISTS"] = 4] = "IS_SIGN_IN_UP_ALLOWED_NO_PRIMARY_USER_EXISTS";
  PROCESS_STATE2[PROCESS_STATE2["IS_SIGN_UP_ALLOWED_CALLED"] = 5] = "IS_SIGN_UP_ALLOWED_CALLED";
  PROCESS_STATE2[PROCESS_STATE2["IS_SIGN_IN_ALLOWED_CALLED"] = 6] = "IS_SIGN_IN_ALLOWED_CALLED";
  PROCESS_STATE2[PROCESS_STATE2["IS_SIGN_IN_UP_ALLOWED_HELPER_CALLED"] = 7] = "IS_SIGN_IN_UP_ALLOWED_HELPER_CALLED";
  PROCESS_STATE2[PROCESS_STATE2["ADDING_NO_CACHE_HEADER_IN_FETCH"] = 8] = "ADDING_NO_CACHE_HEADER_IN_FETCH";
  return PROCESS_STATE2;
})(PROCESS_STATE || {});
class ProcessState {
  constructor() {
    this.history = [];
    this.addState = (state) => {
      if (import_node_process.env.TEST_MODE === "testing") {
        this.history.push(state);
      }
    };
    this.getEventByLastEventByName = (state) => {
      for (let i = this.history.length - 1; i >= 0; i--) {
        if (this.history[i] === state) {
          return this.history[i];
        }
      }
      return void 0;
    };
    this.reset = () => {
      this.history = [];
    };
    this.waitForEvent = async (state, timeInMS = 7e3) => {
      let startTime = Date.now();
      return new Promise((resolve) => {
        let actualThis = this;
        function tryAndGet() {
          let result = actualThis.getEventByLastEventByName(state);
          if (result === void 0) {
            if (Date.now() - startTime > timeInMS) {
              resolve(void 0);
            } else {
              setTimeout(tryAndGet, 1e3);
            }
          } else {
            resolve(result);
          }
        }
        tryAndGet();
      });
    };
  }
  static getInstance() {
    if (ProcessState.instance === void 0) {
      ProcessState.instance = new ProcessState();
    }
    return ProcessState.instance;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PROCESS_STATE,
  ProcessState
});
