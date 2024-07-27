// @ts-nocheck
import type { TypePasswordlessSmsDeliveryInput } from "../../../types";
import type { SmsDeliveryInterface } from "../../../../../ingredients/smsdelivery/types";
import type { UserContext } from "../../../../../types";
export default class BackwardCompatibilityService implements SmsDeliveryInterface<TypePasswordlessSmsDeliveryInput> {
    constructor();
    sendSms: (input: TypePasswordlessSmsDeliveryInput & {
        userContext: UserContext;
    }) => Promise<void>;
}
