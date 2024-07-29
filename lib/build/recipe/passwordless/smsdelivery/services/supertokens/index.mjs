import { SUPERTOKENS_SMS_SERVICE_URL } from "../../../../../ingredients/smsdelivery/services/supertokens";
import Supertokens from "../../../../../supertokens";
import { postWithFetch } from "../../../../../utils";
class SupertokensService {
  constructor(apiKey) {
    this.sendSms = async (input) => {
      let supertokens = Supertokens.getInstanceOrThrowError();
      let appName = supertokens.appInfo.appName;
      const res = await postWithFetch(
        SUPERTOKENS_SMS_SERVICE_URL,
        {
          "api-version": "0",
          "content-type": "application/json; charset=utf-8"
        },
        {
          apiKey: this.apiKey,
          smsInput: {
            type: input.type,
            phoneNumber: input.phoneNumber,
            userInputCode: input.userInputCode,
            urlWithLinkCode: input.urlWithLinkCode,
            codeLifetime: input.codeLifetime,
            isFirstFactor: input.isFirstFactor,
            appName
          }
        },
        {
          successLog: `Passwordless login SMS sent to ${input.phoneNumber}`,
          errorLogHeader: "Error sending SMS"
        }
      );
      if ("error" in res) {
        throw res.error;
      }
      if (res.resp.status >= 400) {
        throw new Error(res.resp.body);
      }
    };
    this.apiKey = apiKey;
  }
}
export {
  SupertokensService as default
};
