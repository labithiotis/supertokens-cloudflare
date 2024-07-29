import { createAndSendEmailUsingSupertokensService } from "../../../passwordResetFunctions";
class BackwardCompatibilityService {
  constructor(appInfo, isInServerlessEnv) {
    this.sendEmail = async (input) => {
      try {
        if (!this.isInServerlessEnv) {
          createAndSendEmailUsingSupertokensService(
            this.appInfo,
            input.user,
            input.passwordResetLink
          ).catch((_) => {
          });
        } else {
          await createAndSendEmailUsingSupertokensService(this.appInfo, input.user, input.passwordResetLink);
        }
      } catch (_) {
      }
    };
    this.isInServerlessEnv = isInServerlessEnv;
    this.appInfo = appInfo;
  }
}
export {
  BackwardCompatibilityService as default
};
