// @ts-nocheck
import type { EmailDeliveryInterface } from "../../../../../ingredients/emaildelivery/types";
import type { ServiceInterface, TypeInput } from "../../../../../ingredients/emaildelivery/services/smtp";
import type { TypeEmailVerificationEmailDeliveryInput } from "../../../types";
import type { UserContext } from "../../../../../types";
export default class SMTPService implements EmailDeliveryInterface<TypeEmailVerificationEmailDeliveryInput> {
    serviceImpl: ServiceInterface<TypeEmailVerificationEmailDeliveryInput>;
    constructor(config: TypeInput<TypeEmailVerificationEmailDeliveryInput>);
    sendEmail: (input: TypeEmailVerificationEmailDeliveryInput & {
        userContext: UserContext;
    }) => Promise<void>;
}
