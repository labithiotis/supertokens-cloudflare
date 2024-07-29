import { SUPERTOKENS_SMS_SERVICE_URL } from "../../../../../ingredients/smsdelivery/services/supertokens";
import Supertokens from "../../../../../supertokens";
import { postWithFetch } from "../../../../../utils";
async function createAndSendSmsUsingSupertokensService(input) {
  let supertokens = Supertokens.getInstanceOrThrowError();
  let appName = supertokens.appInfo.appName;
  const result = await postWithFetch(
    SUPERTOKENS_SMS_SERVICE_URL,
    {
      "api-version": "0",
      "content-type": "application/json; charset=utf-8"
    },
    {
      smsInput: {
        appName,
        type: "PASSWORDLESS_LOGIN",
        phoneNumber: input.phoneNumber,
        userInputCode: input.userInputCode,
        urlWithLinkCode: input.urlWithLinkCode,
        codeLifetime: input.codeLifetime
        // isFirstFactor: input.isFirstFactor,
      }
    },
    {
      successLog: `Passwordless login SMS sent to ${input.phoneNumber}`,
      errorLogHeader: "Error sending passwordless login SMS"
    }
  );
  if ("error" in result) {
    throw result.error;
  }
  if (result.resp.status >= 400) {
    if (result.resp.status !== 429) {
      if (result.resp.body.err) {
        throw new Error(result.resp.body.err);
      } else {
        throw new Error(`Request failed with status code ${result.resp.status}`);
      }
    } else {
      console.log(
        "Free daily SMS quota reached. If you want to use SuperTokens to send SMS, please sign up on supertokens.com to get your SMS API key, else you can also define your own method by overriding the service. For now, we are logging it below:"
      );
      console.log(`
SMS content: ${JSON.stringify(input, null, 2)}`);
    }
  }
}
class BackwardCompatibilityService {
  constructor() {
    this.sendSms = async (input) => {
      await createAndSendSmsUsingSupertokensService({
        phoneNumber: input.phoneNumber,
        userInputCode: input.userInputCode,
        urlWithLinkCode: input.urlWithLinkCode,
        codeLifetime: input.codeLifetime,
        isFirstFactor: input.isFirstFactor
      });
    };
  }
}
export {
  BackwardCompatibilityService as default
};
