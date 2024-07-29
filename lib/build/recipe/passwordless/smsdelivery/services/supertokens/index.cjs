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
var supertokens_exports = {};
__export(supertokens_exports, {
  default: () => SupertokensService
});
module.exports = __toCommonJS(supertokens_exports);
var import_supertokens = require("../../../../../ingredients/smsdelivery/services/supertokens");
var import_supertokens2 = __toESM(require("../../../../../supertokens"), 1);
var import_utils = require("../../../../../utils");
class SupertokensService {
  constructor(apiKey) {
    this.sendSms = async (input) => {
      let supertokens = import_supertokens2.default.getInstanceOrThrowError();
      let appName = supertokens.appInfo.appName;
      const res = await (0, import_utils.postWithFetch)(
        import_supertokens.SUPERTOKENS_SMS_SERVICE_URL,
        {
          "api-version": "0",
          "content-type": "application/json; charset=utf-8"
        },
        {
          apiKey: this.apiKey,
          smsInput: {
            type: input.type,
            phoneNumber: input.phoneNumber,
            userInputCode: input.userInputCode,
            urlWithLinkCode: input.urlWithLinkCode,
            codeLifetime: input.codeLifetime,
            isFirstFactor: input.isFirstFactor,
            appName
          }
        },
        {
          successLog: `Passwordless login SMS sent to ${input.phoneNumber}`,
          errorLogHeader: "Error sending SMS"
        }
      );
      if ("error" in res) {
        throw res.error;
      }
      if (res.resp.status >= 400) {
        throw new Error(res.resp.body);
      }
    };
    this.apiKey = apiKey;
  }
}
