import { createAndSendEmailUsingSupertokensService } from "../../../passwordResetFunctions";
export default class BackwardCompatibilityService {
    constructor(appInfo, isInServerlessEnv) {
        this.sendEmail = async (input) => {
            // we add this here cause the user may have overridden the sendEmail function
            // to change the input email and if we don't do this, the input email
            // will get reset by the getUserById call above.
            try {
                if (!this.isInServerlessEnv) {
                    createAndSendEmailUsingSupertokensService(this.appInfo, input.user, input.passwordResetLink).catch((_) => { });
                }
                else {
                    // see https://github.com/supertokens/supertokens-node/pull/135
                    await createAndSendEmailUsingSupertokensService(this.appInfo, input.user, input.passwordResetLink);
                }
            }
            catch (_) { }
        };
        this.isInServerlessEnv = isInServerlessEnv;
        this.appInfo = appInfo;
    }
}
