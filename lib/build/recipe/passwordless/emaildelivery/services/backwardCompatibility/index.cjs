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
var backwardCompatibility_exports = {};
__export(backwardCompatibility_exports, {
  default: () => BackwardCompatibilityService
});
module.exports = __toCommonJS(backwardCompatibility_exports);
var import_utils = require("../../../../../utils");
var import_node_process = require("node:process");
async function createAndSendEmailUsingSupertokensService(input) {
  if (import_node_process.env.TEST_MODE === "testing") {
    return;
  }
  const result = await (0, import_utils.postWithFetch)(
    "https://api.supertokens.io/0/st/auth/passwordless/login",
    {
      "api-version": "0",
      "content-type": "application/json; charset=utf-8"
    },
    {
      email: input.email,
      appName: input.appInfo.appName,
      codeLifetime: input.codeLifetime,
      urlWithLinkCode: input.urlWithLinkCode,
      userInputCode: input.userInputCode
      // isFirstFactor: input.isFirstFactor,
    },
    {
      successLog: `Email sent to ${input.email}`,
      errorLogHeader: "Error sending passwordless login email"
    }
  );
  if ("error" in result) {
    throw result.error;
  }
  if (result.resp && result.resp.status >= 400) {
    if (result.resp.body.err) {
      throw new Error(result.resp.body.err);
    } else {
      throw new Error(`Request failed with status code ${result.resp.status}`);
    }
  }
}
class BackwardCompatibilityService {
  constructor(appInfo) {
    this.sendEmail = async (input) => {
      await createAndSendEmailUsingSupertokensService({
        appInfo: this.appInfo,
        email: input.email,
        userInputCode: input.userInputCode,
        urlWithLinkCode: input.urlWithLinkCode,
        codeLifetime: input.codeLifetime,
        isFirstFactor: input.isFirstFactor
      });
    };
    this.appInfo = appInfo;
  }
}
