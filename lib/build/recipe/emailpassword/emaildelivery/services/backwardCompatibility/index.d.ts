// @ts-nocheck
import type { TypeEmailPasswordEmailDeliveryInput } from "../../../types";
import type { NormalisedAppinfo, UserContext } from "../../../../../types";
import type { EmailDeliveryInterface } from "../../../../../ingredients/emaildelivery/types";
export default class BackwardCompatibilityService implements EmailDeliveryInterface<TypeEmailPasswordEmailDeliveryInput> {
    private isInServerlessEnv;
    private appInfo;
    constructor(appInfo: NormalisedAppinfo, isInServerlessEnv: boolean);
    sendEmail: (input: TypeEmailPasswordEmailDeliveryInput & {
        userContext: UserContext;
    }) => Promise<void>;
}
