import { postWithFetch } from "../../utils";
import { env } from "node:process";
async function createAndSendEmailUsingSupertokensService(appInfo, user, emailVerifyURLWithToken) {
  if (env.TEST_MODE === "testing") {
    return;
  }
  await postWithFetch(
    "https://api.supertokens.io/0/st/auth/email/verify",
    {
      "api-version": "0",
      "content-type": "application/json; charset=utf-8"
    },
    {
      email: user.email,
      appName: appInfo.appName,
      emailVerifyURL: emailVerifyURLWithToken
    },
    {
      successLog: `Email sent to ${user.email}`,
      errorLogHeader: "Error sending verification email"
    }
  );
}
export {
  createAndSendEmailUsingSupertokensService
};
