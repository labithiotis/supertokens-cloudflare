"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
var twilio_exports = {};
__export(twilio_exports, {
  default: () => TwilioService
});
module.exports = __toCommonJS(twilio_exports);
var import_twilio = require("../../../../../ingredients/smsdelivery/services/twilio");
var import_twilio2 = __toESM(require("twilio"), 1);
var import_supertokens_js_override = __toESM(require("supertokens-js-override"), 1);
var import_serviceImplementation = require("./serviceImplementation");
class TwilioService {
  constructor(config) {
    this.sendSms = async (input) => {
      let content = await this.serviceImpl.getContent(input);
      if ("from" in this.config.twilioSettings) {
        await this.serviceImpl.sendRawSms(__spreadProps(__spreadValues({}, content), {
          userContext: input.userContext,
          from: this.config.twilioSettings.from
        }));
      } else {
        await this.serviceImpl.sendRawSms(__spreadProps(__spreadValues({}, content), {
          userContext: input.userContext,
          messagingServiceSid: this.config.twilioSettings.messagingServiceSid
        }));
      }
    };
    this.config = (0, import_twilio.normaliseUserInputConfig)(config);
    const twilioClient = (0, import_twilio2.default)(
      config.twilioSettings.accountSid,
      config.twilioSettings.authToken,
      config.twilioSettings.opts
    );
    let builder = new import_supertokens_js_override.default((0, import_serviceImplementation.getServiceImplementation)(twilioClient));
    if (config.override !== void 0) {
      builder = builder.override(config.override);
    }
    this.serviceImpl = builder.build();
  }
}
