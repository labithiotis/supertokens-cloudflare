// @ts-nocheck
import type { ServiceInterface, TypeInput } from "../../../../../ingredients/emaildelivery/services/smtp";
import type { TypeEmailPasswordEmailDeliveryInput } from "../../../types";
import type { EmailDeliveryInterface } from "../../../../../ingredients/emaildelivery/types";
import type { UserContext } from "../../../../../types";
export default class SMTPService implements EmailDeliveryInterface<TypeEmailPasswordEmailDeliveryInput> {
    serviceImpl: ServiceInterface<TypeEmailPasswordEmailDeliveryInput>;
    constructor(config: TypeInput<TypeEmailPasswordEmailDeliveryInput>);
    sendEmail: (input: TypeEmailPasswordEmailDeliveryInput & {
        userContext: UserContext;
    }) => Promise<void>;
}
