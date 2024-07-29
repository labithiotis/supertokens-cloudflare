import { postWithFetch } from "../../utils";
import { env } from "node:process";
async function createAndSendEmailUsingSupertokensService(appInfo, user, passwordResetURLWithToken) {
  if (env.TEST_MODE === "testing") {
    return;
  }
  await postWithFetch(
    "https://api.supertokens.io/0/st/auth/password/reset",
    {
      "api-version": "0",
      "content-type": "application/json; charset=utf-8"
    },
    {
      email: user.email,
      appName: appInfo.appName,
      passwordResetURL: passwordResetURLWithToken
    },
    {
      successLog: `Password reset email sent to ${user.email}`,
      errorLogHeader: "Error sending password reset email"
    }
  );
}
export {
  createAndSendEmailUsingSupertokensService
};
