import { doGetRequest } from "./utils";
import NewProvider from "./custom";
import { logDebugMessage } from "../../../logger";
function Bitbucket(input) {
  if (input.config.name === void 0) {
    input.config.name = "Bitbucket";
  }
  if (input.config.authorizationEndpoint === void 0) {
    input.config.authorizationEndpoint = "https://bitbucket.org/site/oauth2/authorize";
  }
  if (input.config.tokenEndpoint === void 0) {
    input.config.tokenEndpoint = "https://bitbucket.org/site/oauth2/access_token";
  }
  if (input.config.authorizationEndpointQueryParams === void 0) {
    input.config.authorizationEndpointQueryParams = {
      audience: "api.atlassian.com"
    };
  }
  const oOverride = input.override;
  input.override = function(originalImplementation) {
    const oGetConfig = originalImplementation.getConfigForClientType;
    originalImplementation.getConfigForClientType = async function(input2) {
      const config = await oGetConfig(input2);
      if (config.scope === void 0) {
        config.scope = ["account", "email"];
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
        "https://api.bitbucket.org/2.0/user",
        void 0,
        headers
      );
      if (userInfoFromAccessToken.status >= 400) {
        logDebugMessage(
          `Received response with status ${userInfoFromAccessToken.status} and body ${userInfoFromAccessToken.stringResponse}`
        );
        throw new Error(
          `Received response with status ${userInfoFromAccessToken.status} and body ${userInfoFromAccessToken.stringResponse}`
        );
      }
      rawUserInfoFromProvider.fromUserInfoAPI = userInfoFromAccessToken.jsonResponse;
      const userInfoFromEmail = await doGetRequest(
        "https://api.bitbucket.org/2.0/user/emails",
        void 0,
        headers
      );
      if (userInfoFromEmail.status >= 400) {
        logDebugMessage(
          `Received response with status ${userInfoFromEmail.status} and body ${userInfoFromEmail.stringResponse}`
        );
        throw new Error(
          `Received response with status ${userInfoFromEmail.status} and body ${userInfoFromEmail.stringResponse}`
        );
      }
      rawUserInfoFromProvider.fromUserInfoAPI.email = userInfoFromEmail.jsonResponse;
      let email = void 0;
      let isVerified = false;
      for (const emailInfo of userInfoFromEmail.jsonResponse.values) {
        if (emailInfo.is_primary) {
          email = emailInfo.email;
          isVerified = emailInfo.is_confirmed;
        }
      }
      return {
        thirdPartyUserId: rawUserInfoFromProvider.fromUserInfoAPI.uuid,
        email: email === void 0 ? void 0 : {
          id: email,
          isVerified
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
  Bitbucket as default
};
