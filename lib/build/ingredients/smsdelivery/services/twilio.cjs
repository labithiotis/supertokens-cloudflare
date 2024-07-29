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
var twilio_exports = {};
__export(twilio_exports, {
  normaliseUserInputConfig: () => normaliseUserInputConfig
});
module.exports = __toCommonJS(twilio_exports);
function normaliseUserInputConfig(input) {
  let from = "from" in input.twilioSettings ? input.twilioSettings.from : void 0;
  let messagingServiceSid = "messagingServiceSid" in input.twilioSettings ? input.twilioSettings.messagingServiceSid : void 0;
  if (from === void 0 && messagingServiceSid === void 0 || from !== void 0 && messagingServiceSid !== void 0) {
    throw Error(`Please pass exactly one of "from" and "messagingServiceSid" config for twilioSettings.`);
  }
  return input;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  normaliseUserInputConfig
});
