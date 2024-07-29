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
import { createTransport } from "nodemailer";
import OverrideableBuilder from "supertokens-js-override";
import { getServiceImplementation } from "./serviceImplementation";
class SMTPService {
  constructor(config) {
    this.sendEmail = async (input) => {
      let content = await this.serviceImpl.getContent(input);
      await this.serviceImpl.sendRawEmail(__spreadProps(__spreadValues({}, content), {
        userContext: input.userContext
      }));
    };
    const transporter = createTransport({
      host: config.smtpSettings.host,
      port: config.smtpSettings.port,
      auth: {
        user: config.smtpSettings.authUsername || config.smtpSettings.from.email,
        pass: config.smtpSettings.password
      },
      secure: config.smtpSettings.secure
    });
    let builder = new OverrideableBuilder(getServiceImplementation(transporter, config.smtpSettings.from));
    if (config.override !== void 0) {
      builder = builder.override(config.override);
    }
    this.serviceImpl = builder.build();
  }
}
export {
  SMTPService as default
};
