// @ts-nocheck
import type { TypePasswordlessEmailDeliveryInput } from "../../../types";
import type { EmailDeliveryInterface } from "../../../../../ingredients/emaildelivery/types";
import type { NormalisedAppinfo, UserContext } from "../../../../../types";
export default class BackwardCompatibilityService implements EmailDeliveryInterface<TypePasswordlessEmailDeliveryInput> {
    private appInfo;
    constructor(appInfo: NormalisedAppinfo);
    sendEmail: (input: TypePasswordlessEmailDeliveryInput & {
        userContext: UserContext;
    }) => Promise<void>;
}
