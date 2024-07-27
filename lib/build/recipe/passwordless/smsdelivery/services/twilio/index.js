import { normaliseUserInputConfig } from "../../../../../ingredients/smsdelivery/services/twilio";
import Twilio from "twilio";
import OverrideableBuilder from "supertokens-js-override";
import { getServiceImplementation } from "./serviceImplementation";
export default class TwilioService {
    constructor(config) {
        this.sendSms = async (input) => {
            let content = await this.serviceImpl.getContent(input);
            if ("from" in this.config.twilioSettings) {
                await this.serviceImpl.sendRawSms(Object.assign(Object.assign({}, content), { userContext: input.userContext, from: this.config.twilioSettings.from }));
            }
            else {
                await this.serviceImpl.sendRawSms(Object.assign(Object.assign({}, content), { userContext: input.userContext, messagingServiceSid: this.config.twilioSettings.messagingServiceSid }));
            }
        };
        this.config = normaliseUserInputConfig(config);
        const twilioClient = Twilio(config.twilioSettings.accountSid, config.twilioSettings.authToken, config.twilioSettings.opts);
        let builder = new OverrideableBuilder(getServiceImplementation(twilioClient));
        if (config.override !== undefined) {
            builder = builder.override(config.override);
        }
        this.serviceImpl = builder.build();
    }
}
