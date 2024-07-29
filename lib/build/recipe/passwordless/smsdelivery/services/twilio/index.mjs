var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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
import { normaliseUserInputConfig } from "../../../../../ingredients/smsdelivery/services/twilio";
import Twilio from "twilio";
import OverrideableBuilder from "supertokens-js-override";
import { getServiceImplementation } from "./serviceImplementation";
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
    this.config = normaliseUserInputConfig(config);
    const twilioClient = Twilio(
      config.twilioSettings.accountSid,
      config.twilioSettings.authToken,
      config.twilioSettings.opts
    );
    let builder = new OverrideableBuilder(getServiceImplementation(twilioClient));
    if (config.override !== void 0) {
      builder = builder.override(config.override);
    }
    this.serviceImpl = builder.build();
  }
}
export {
  TwilioService as default
};
