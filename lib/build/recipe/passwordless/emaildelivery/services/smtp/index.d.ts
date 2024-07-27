// @ts-nocheck
import type { ServiceInterface, TypeInput } from "../../../../../ingredients/emaildelivery/services/smtp";
import type { EmailDeliveryInterface } from "../../../../../ingredients/emaildelivery/types";
import type { TypePasswordlessEmailDeliveryInput } from "../../../types";
import type { UserContext } from "../../../../../types";
export default class SMTPService implements EmailDeliveryInterface<TypePasswordlessEmailDeliveryInput> {
    serviceImpl: ServiceInterface<TypePasswordlessEmailDeliveryInput>;
    constructor(config: TypeInput<TypePasswordlessEmailDeliveryInput>);
    sendEmail: (input: TypePasswordlessEmailDeliveryInput & {
        userContext: UserContext;
    }) => Promise<void>;
}
