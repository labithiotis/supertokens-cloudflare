// @ts-nocheck
import type { SmsDeliveryInterface } from "../../../../../ingredients/smsdelivery/types";
import type { TypePasswordlessSmsDeliveryInput } from "../../../types";
export default class SupertokensService implements SmsDeliveryInterface<TypePasswordlessSmsDeliveryInput> {
    private apiKey;
    constructor(apiKey: string);
    sendSms: (input: TypePasswordlessSmsDeliveryInput) => Promise<void>;
}
