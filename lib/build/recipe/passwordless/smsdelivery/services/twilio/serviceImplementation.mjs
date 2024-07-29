import getPasswordlessLoginSmsContent from "./passwordlessLogin";
function getServiceImplementation(twilioClient) {
  return {
    sendRawSms: async function(input) {
      if ("from" in input) {
        await twilioClient.messages.create({
          to: input.toPhoneNumber,
          body: input.body,
          from: input.from
        });
      } else {
        await twilioClient.messages.create({
          to: input.toPhoneNumber,
          body: input.body,
          messagingServiceSid: input.messagingServiceSid
        });
      }
    },
    getContent: async function(input) {
      return getPasswordlessLoginSmsContent(input);
    }
  };
}
export {
  getServiceImplementation
};
