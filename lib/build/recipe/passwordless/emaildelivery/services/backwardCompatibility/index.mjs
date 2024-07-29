import { postWithFetch } from "../../../../../utils";
import { env } from "node:process";
async function createAndSendEmailUsingSupertokensService(input) {
  if (env.TEST_MODE === "testing") {
    return;
  }
  const result = await postWithFetch(
    "https://api.supertokens.io/0/st/auth/passwordless/login",
    {
      "api-version": "0",
      "content-type": "application/json; charset=utf-8"
    },
    {
      email: input.email,
      appName: input.appInfo.appName,
      codeLifetime: input.codeLifetime,
      urlWithLinkCode: input.urlWithLinkCode,
      userInputCode: input.userInputCode
      // isFirstFactor: input.isFirstFactor,
    },
    {
      successLog: `Email sent to ${input.email}`,
      errorLogHeader: "Error sending passwordless login email"
    }
  );
  if ("error" in result) {
    throw result.error;
  }
  if (result.resp && result.resp.status >= 400) {
    if (result.resp.body.err) {
      throw new Error(result.resp.body.err);
    } else {
      throw new Error(`Request failed with status code ${result.resp.status}`);
    }
  }
}
class BackwardCompatibilityService {
  constructor(appInfo) {
    this.sendEmail = async (input) => {
      await createAndSendEmailUsingSupertokensService({
        appInfo: this.appInfo,
        email: input.email,
        userInputCode: input.userInputCode,
        urlWithLinkCode: input.urlWithLinkCode,
        codeLifetime: input.codeLifetime,
        isFirstFactor: input.isFirstFactor
      });
    };
    this.appInfo = appInfo;
  }
}
export {
  BackwardCompatibilityService as default
};