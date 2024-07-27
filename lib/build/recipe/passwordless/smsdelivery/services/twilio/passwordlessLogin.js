import { humaniseMilliseconds } from "../../../../../utils";
import Supertokens from "../../../../../supertokens";
export default function getPasswordlessLoginSmsContent(input) {
    let supertokens = Supertokens.getInstanceOrThrowError();
    let appName = supertokens.appInfo.appName;
    let body = getPasswordlessLoginSmsBody(appName, input.codeLifetime, input.urlWithLinkCode, input.userInputCode);
    return {
        body,
        toPhoneNumber: input.phoneNumber,
    };
}
function getPasswordlessLoginSmsBody(appName, codeLifetime, urlWithLinkCode, userInputCode) {
    let message = "";
    if (urlWithLinkCode !== undefined && userInputCode !== undefined) {
        message += `OTP to login is ${userInputCode} for ${appName}\n\nOR click ${urlWithLinkCode} to login.\n\n`;
    }
    else if (urlWithLinkCode !== undefined) {
        message += `Click ${urlWithLinkCode} to login to ${appName}\n\n`;
    }
    else {
        message += `OTP to login is ${userInputCode} for ${appName}\n\n`;
    }
    const humanisedCodeLifetime = humaniseMilliseconds(codeLifetime);
    message += `This is valid for ${humanisedCodeLifetime}.`;
    return message;
}
