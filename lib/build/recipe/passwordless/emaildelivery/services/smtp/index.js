import { createTransport } from "nodemailer";
import OverrideableBuilder from "supertokens-js-override";
import { getServiceImplementation } from "./serviceImplementation";
export default class SMTPService {
    constructor(config) {
        this.sendEmail = async (input) => {
            let content = await this.serviceImpl.getContent(input);
            await this.serviceImpl.sendRawEmail(
                Object.assign(Object.assign({}, content), { userContext: input.userContext })
            );
        };
        const transporter = createTransport({
            host: config.smtpSettings.host,
            port: config.smtpSettings.port,
            auth: {
                user: config.smtpSettings.authUsername || config.smtpSettings.from.email,
                pass: config.smtpSettings.password,
            },
            secure: config.smtpSettings.secure,
        });
        let builder = new OverrideableBuilder(getServiceImplementation(transporter, config.smtpSettings.from));
        if (config.override !== undefined) {
            builder = builder.override(config.override);
        }
        this.serviceImpl = builder.build();
    }
}
