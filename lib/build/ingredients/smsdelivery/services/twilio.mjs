function normaliseUserInputConfig(input) {
  let from = "from" in input.twilioSettings ? input.twilioSettings.from : void 0;
  let messagingServiceSid = "messagingServiceSid" in input.twilioSettings ? input.twilioSettings.messagingServiceSid : void 0;
  if (from === void 0 && messagingServiceSid === void 0 || from !== void 0 && messagingServiceSid !== void 0) {
    throw Error(`Please pass exactly one of "from" and "messagingServiceSid" config for twilioSettings.`);
  }
  return input;
}
export {
  normaliseUserInputConfig
};
