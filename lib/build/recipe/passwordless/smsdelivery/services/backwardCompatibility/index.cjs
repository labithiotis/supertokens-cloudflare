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
var backwardCompatibility_exports = {};
__export(backwardCompatibility_exports, {
  default: () => BackwardCompatibilityService
});
module.exports = __toCommonJS(backwardCompatibility_exports);
var import_supertokens = require("../../../../../ingredients/smsdelivery/services/supertokens");
var import_supertokens2 = __toESM(require("../../../../../supertokens"), 1);
var import_utils = require("../../../../../utils");
async function createAndSendSmsUsingSupertokensService(input) {
  let supertokens = import_supertokens2.default.getInstanceOrThrowError();
  let appName = supertokens.appInfo.appName;
  const result = await (0, import_utils.postWithFetch)(
    import_supertokens.SUPERTOKENS_SMS_SERVICE_URL,
    {
      "api-version": "0",
      "content-type": "application/json; charset=utf-8"
    },
    {
      smsInput: {
        appName,
        type: "PASSWORDLESS_LOGIN",
        phoneNumber: input.phoneNumber,
        userInputCode: input.userInputCode,
        urlWithLinkCode: input.urlWithLinkCode,
        codeLifetime: input.codeLifetime
        // isFirstFactor: input.isFirstFactor,
      }
    },
    {
      successLog: `Passwordless login SMS sent to ${input.phoneNumber}`,
      errorLogHeader: "Error sending passwordless login SMS"
    }
  );
  if ("error" in result) {
    throw result.error;
  }
  if (result.resp.status >= 400) {
    if (result.resp.status !== 429) {
      if (result.resp.body.err) {
        throw new Error(result.resp.body.err);
      } else {
        throw new Error(`Request failed with status code ${result.resp.status}`);
      }
    } else {
      console.log(
        "Free daily SMS quota reached. If you want to use SuperTokens to send SMS, please sign up on supertokens.com to get your SMS API key, else you can also define your own method by overriding the service. For now, we are logging it below:"
      );
      console.log(`
SMS content: ${JSON.stringify(input, null, 2)}`);
    }
  }
}
class BackwardCompatibilityService {
  constructor() {
    this.sendSms = async (input) => {
      await createAndSendSmsUsingSupertokensService({
        phoneNumber: input.phoneNumber,
        userInputCode: input.userInputCode,
        urlWithLinkCode: input.urlWithLinkCode,
        codeLifetime: input.codeLifetime,
        isFirstFactor: input.isFirstFactor
      });
    };
  }
}
