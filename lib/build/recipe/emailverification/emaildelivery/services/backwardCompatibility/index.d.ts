// @ts-nocheck
import type { TypeEmailVerificationEmailDeliveryInput } from "../../../types";
import type { NormalisedAppinfo, UserContext } from "../../../../../types";
import type { EmailDeliveryInterface } from "../../../../../ingredients/emaildelivery/types";
export default class BackwardCompatibilityService implements EmailDeliveryInterface<TypeEmailVerificationEmailDeliveryInput> {
    private appInfo;
    private isInServerlessEnv;
    constructor(appInfo: NormalisedAppinfo, isInServerlessEnv: boolean);
    sendEmail: (input: TypeEmailVerificationEmailDeliveryInput & {
        userContext: UserContext;
    }) => Promise<void>;
}
