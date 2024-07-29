import { isAnIpAddress } from "./utils";
class NormalisedURLDomain {
  constructor(url) {
    this.getAsStringDangerous = () => {
      return this.value;
    };
    this.value = normaliseURLDomainOrThrowError(url);
  }
}
function normaliseURLDomainOrThrowError(input, ignoreProtocol = false) {
  input = input.trim().toLowerCase();
  try {
    if (!input.startsWith("http://") && !input.startsWith("https://") && !input.startsWith("supertokens://")) {
      throw new Error("converting to proper URL");
    }
    let urlObj = new URL(input);
    if (ignoreProtocol) {
      if (urlObj.hostname.startsWith("localhost") || isAnIpAddress(urlObj.hostname)) {
        input = "http://" + urlObj.host;
      } else {
        input = "https://" + urlObj.host;
      }
    } else {
      input = urlObj.protocol + "//" + urlObj.host;
    }
    return input;
  } catch (err) {
  }
  if (input.startsWith("/")) {
    throw Error("Please provide a valid domain name");
  }
  if (input.indexOf(".") === 0) {
    input = input.substr(1);
  }
  if ((input.indexOf(".") !== -1 || input.startsWith("localhost")) && !input.startsWith("http://") && !input.startsWith("https://")) {
    input = "https://" + input;
    try {
      new URL(input);
      return normaliseURLDomainOrThrowError(input, true);
    } catch (err) {
    }
  }
  throw Error("Please provide a valid domain name");
}
export {
  NormalisedURLDomain as default
};
