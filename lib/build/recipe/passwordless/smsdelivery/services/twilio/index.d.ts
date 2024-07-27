// @ts-nocheck
import type { ServiceInterface, TypeInput } from "../../../../../ingredients/smsdelivery/services/twilio";
import type { SmsDeliveryInterface } from "../../../../../ingredients/smsdelivery/types";
import type { TypePasswordlessSmsDeliveryInput } from "../../../types";
import type { UserContext } from "../../../../../types";
export default class TwilioService implements SmsDeliveryInterface<TypePasswordlessSmsDeliveryInput> {
    serviceImpl: ServiceInterface<TypePasswordlessSmsDeliveryInput>;
    private config;
    constructor(config: TypeInput<TypePasswordlessSmsDeliveryInput>);
    sendSms: (input: TypePasswordlessSmsDeliveryInput & {
        userContext: UserContext;
    }) => Promise<void>;
}
