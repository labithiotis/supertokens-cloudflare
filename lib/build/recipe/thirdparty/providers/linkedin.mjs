import { logDebugMessage } from "../../../logger";
import NewProvider from "./custom";
import { doGetRequest } from "./utils";
function Linkedin(input) {
  if (input.config.name === void 0) {
    input.config.name = "LinkedIn";
  }
  if (input.config.authorizationEndpoint === void 0) {
    input.config.authorizationEndpoint = "https://www.linkedin.com/oauth/v2/authorization";
  }
  if (input.config.tokenEndpoint === void 0) {
    input.config.tokenEndpoint = "https://www.linkedin.com/oauth/v2/accessToken";
  }
  const oOverride = input.override;
  input.override = function(originalImplementation) {
    const oGetConfig = originalImplementation.getConfigForClientType;
    originalImplementation.getConfigForClientType = async function(input2) {
      const config = await oGetConfig(input2);
      if (config.scope === void 0) {
        config.scope = ["openid", "profile", "email"];
      }
      return config;
    };
    originalImplementation.getUserInfo = async function(input2) {
      const accessToken = input2.oAuthTokens.access_token;
      if (accessToken === void 0) {
        throw new Error("Access token not found");
      }
      const headers = {
        Authorization: `Bearer ${accessToken}`
      };
      let rawUserInfoFromProvider = {
        fromUserInfoAPI: {},
        fromIdTokenPayload: {}
      };
      const userInfoFromAccessToken = await doGetRequest(
        "https://api.linkedin.com/v2/userinfo",
        void 0,
        headers
      );
      rawUserInfoFromProvider.fromUserInfoAPI = userInfoFromAccessToken.jsonResponse;
      if (userInfoFromAccessToken.status >= 400) {
        logDebugMessage(
          `Received response with status ${userInfoFromAccessToken.status} and body ${userInfoFromAccessToken.stringResponse}`
        );
        throw new Error(
          `Received response with status ${userInfoFromAccessToken.status} and body ${userInfoFromAccessToken.stringResponse}`
        );
      }
      return {
        thirdPartyUserId: rawUserInfoFromProvider.fromUserInfoAPI.sub,
        email: {
          id: rawUserInfoFromProvider.fromUserInfoAPI.email,
          isVerified: rawUserInfoFromProvider.fromUserInfoAPI.email_verified
        },
        rawUserInfoFromProvider
      };
    };
    if (oOverride !== void 0) {
      originalImplementation = oOverride(originalImplementation);
    }
    return originalImplementation;
  };
  return NewProvider(input);
}
export {
  Linkedin as default
};
