import { humaniseMilliseconds } from "../../../../../utils";
import Supertokens from "../../../../../supertokens";
function getPasswordlessLoginSmsContent(input) {
  let supertokens = Supertokens.getInstanceOrThrowError();
  let appName = supertokens.appInfo.appName;
  let body = getPasswordlessLoginSmsBody(appName, input.codeLifetime, input.urlWithLinkCode, input.userInputCode);
  return {
    body,
    toPhoneNumber: input.phoneNumber
  };
}
function getPasswordlessLoginSmsBody(appName, codeLifetime, urlWithLinkCode, userInputCode) {
  let message = "";
  if (urlWithLinkCode !== void 0 && userInputCode !== void 0) {
    message += `OTP to login is ${userInputCode} for ${appName}

OR click ${urlWithLinkCode} to login.

`;
  } else if (urlWithLinkCode !== void 0) {
    message += `Click ${urlWithLinkCode} to login to ${appName}

`;
  } else {
    message += `OTP to login is ${userInputCode} for ${appName}

`;
  }
  const humanisedCodeLifetime = humaniseMilliseconds(codeLifetime);
  message += `This is valid for ${humanisedCodeLifetime}.`;
  return message;
}
export {
  getPasswordlessLoginSmsContent as default
};
