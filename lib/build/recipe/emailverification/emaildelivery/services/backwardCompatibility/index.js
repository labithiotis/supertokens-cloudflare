import { createAndSendEmailUsingSupertokensService } from "../../../emailVerificationFunctions";
export default class BackwardCompatibilityService {
    constructor(appInfo, isInServerlessEnv) {
        this.sendEmail = async (input) => {
            try {
                if (!this.isInServerlessEnv) {
                    createAndSendEmailUsingSupertokensService(this.appInfo, input.user, input.emailVerifyLink).catch((_) => { });
                }
                else {
                    // see https://github.com/supertokens/supertokens-node/pull/135
                    await createAndSendEmailUsingSupertokensService(this.appInfo, input.user, input.emailVerifyLink);
                }
            }
            catch (_) { }
        };
        this.appInfo = appInfo;
        this.isInServerlessEnv = isInServerlessEnv;
    }
}
