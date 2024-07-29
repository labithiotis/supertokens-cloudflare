"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const twilio_1 = require("../../../../../ingredients/smsdelivery/services/twilio");
const twilio_2 = __importDefault(require("twilio"));
const supertokens_js_override_1 = __importDefault(require("supertokens-js-override"));
const serviceImplementation_1 = require("./serviceImplementation");
class TwilioService {
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
        this.config = (0, twilio_1.normaliseUserInputConfig)(config);
        const twilioClient = (0, twilio_2.default)(config.twilioSettings.accountSid, config.twilioSettings.authToken, config.twilioSettings.opts);
        let builder = new supertokens_js_override_1.default((0, serviceImplementation_1.getServiceImplementation)(twilioClient));
        if (config.override !== undefined) {
            builder = builder.override(config.override);
        }
        this.serviceImpl = builder.build();
    }
}
exports.default = TwilioService;
