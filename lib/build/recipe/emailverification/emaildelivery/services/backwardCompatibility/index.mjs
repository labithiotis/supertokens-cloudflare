import { createAndSendEmailUsingSupertokensService } from "../../../emailVerificationFunctions";
class BackwardCompatibilityService {
  constructor(appInfo, isInServerlessEnv) {
    this.sendEmail = async (input) => {
      try {
        if (!this.isInServerlessEnv) {
          createAndSendEmailUsingSupertokensService(
            this.appInfo,
            input.user,
            input.emailVerifyLink
          ).catch((_) => {
          });
        } else {
          await createAndSendEmailUsingSupertokensService(this.appInfo, input.user, input.emailVerifyLink);
        }
      } catch (_) {
      }
    };
    this.appInfo = appInfo;
    this.isInServerlessEnv = isInServerlessEnv;
  }
}
export {
  BackwardCompatibilityService as default
};
