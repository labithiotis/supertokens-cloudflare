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
var passwordResetFunctions_exports = {};
__export(passwordResetFunctions_exports, {
  createAndSendEmailUsingSupertokensService: () => createAndSendEmailUsingSupertokensService
});
module.exports = __toCommonJS(passwordResetFunctions_exports);
var import_utils = require("../../utils");
var import_node_process = require("node:process");
async function createAndSendEmailUsingSupertokensService(appInfo, user, passwordResetURLWithToken) {
  if (import_node_process.env.TEST_MODE === "testing") {
    return;
  }
  await (0, import_utils.postWithFetch)(
    "https://api.supertokens.io/0/st/auth/password/reset",
    {
      "api-version": "0",
      "content-type": "application/json; charset=utf-8"
    },
    {
      email: user.email,
      appName: appInfo.appName,
      passwordResetURL: passwordResetURLWithToken
    },
    {
      successLog: `Password reset email sent to ${user.email}`,
      errorLogHeader: "Error sending password reset email"
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createAndSendEmailUsingSupertokensService
});
