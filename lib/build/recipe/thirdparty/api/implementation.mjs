var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
import EmailVerification from "../../emailverification";
import EmailVerificationRecipe from "../../emailverification/recipe";
import { AuthUtils } from "../../../authUtils";
import { logDebugMessage } from "../../../logger";
import { Buffer as Buffer2 } from "node:buffer";
function getAPIInterface() {
  return {
    authorisationUrlGET: async function({ provider, redirectURIOnProviderDashboard, userContext }) {
      const authUrl = await provider.getAuthorisationRedirectURL({
        redirectURIOnProviderDashboard,
        userContext
      });
      return __spreadValues({
        status: "OK"
      }, authUrl);
    },
    signInUpPOST: async function(input) {
      const errorCodeMap = {
        SIGN_UP_NOT_ALLOWED: "Cannot sign in / up due to security reasons. Please try a different login method or contact support. (ERR_CODE_006)",
        SIGN_IN_NOT_ALLOWED: "Cannot sign in / up due to security reasons. Please try a different login method or contact support. (ERR_CODE_004)",
        LINKING_TO_SESSION_USER_FAILED: {
          EMAIL_VERIFICATION_REQUIRED: "Cannot sign in / up due to security reasons. Please contact support. (ERR_CODE_020)",
          RECIPE_USER_ID_ALREADY_LINKED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR: "Cannot sign in / up due to security reasons. Please contact support. (ERR_CODE_021)",
          ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR: "Cannot sign in / up due to security reasons. Please contact support. (ERR_CODE_022)",
          SESSION_USER_ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR: "Cannot sign in / up due to security reasons. Please contact support. (ERR_CODE_023)"
        }
      };
      const { provider, tenantId, options, userContext } = input;
      let oAuthTokensToUse = {};
      if ("redirectURIInfo" in input && input.redirectURIInfo !== void 0) {
        oAuthTokensToUse = await provider.exchangeAuthCodeForOAuthTokens({
          redirectURIInfo: input.redirectURIInfo,
          userContext
        });
      } else if ("oAuthTokens" in input && input.oAuthTokens !== void 0) {
        oAuthTokensToUse = input.oAuthTokens;
      } else {
        throw Error("should never come here");
      }
      const userInfo = await provider.getUserInfo({ oAuthTokens: oAuthTokensToUse, userContext });
      if (userInfo.email === void 0 && provider.config.requireEmail === false) {
        userInfo.email = {
          id: await provider.config.generateFakeEmail({
            thirdPartyUserId: userInfo.thirdPartyUserId,
            tenantId,
            userContext
          }),
          isVerified: true
        };
      }
      let emailInfo = userInfo.email;
      if (emailInfo === void 0) {
        return {
          status: "NO_EMAIL_GIVEN_BY_PROVIDER"
        };
      }
      const recipeId = "thirdparty";
      let checkCredentialsOnTenant = async () => {
        return true;
      };
      const authenticatingUser = await AuthUtils.getAuthenticatingUserAndAddToCurrentTenantIfRequired({
        accountInfo: {
          thirdParty: {
            userId: userInfo.thirdPartyUserId,
            id: provider.id
          }
        },
        recipeId,
        userContext: input.userContext,
        session: input.session,
        tenantId,
        checkCredentialsOnTenant
      });
      const isSignUp = authenticatingUser === void 0;
      if (authenticatingUser !== void 0) {
        const recipeUserId = authenticatingUser.loginMethod.recipeUserId;
        if (!emailInfo.isVerified && EmailVerificationRecipe.getInstance() !== void 0) {
          emailInfo.isVerified = await EmailVerification.isEmailVerified(
            recipeUserId,
            emailInfo.id,
            userContext
          );
        }
      }
      const preAuthChecks = await AuthUtils.preAuthChecks({
        authenticatingAccountInfo: {
          recipeId,
          email: emailInfo.id,
          thirdParty: {
            userId: userInfo.thirdPartyUserId,
            id: provider.id
          }
        },
        authenticatingUser: authenticatingUser == null ? void 0 : authenticatingUser.user,
        factorIds: ["thirdparty"],
        isSignUp,
        isVerified: emailInfo.isVerified,
        // this can be true if:
        // - the third party provider marked the email as verified
        // - the email address is changing and the new address has been verified previously
        // in both cases, the user will end up with a verified login method after sign in completes
        signInVerifiesLoginMethod: emailInfo.isVerified,
        skipSessionUserUpdateInCore: false,
        tenantId: input.tenantId,
        userContext: input.userContext,
        session: input.session
      });
      if (preAuthChecks.status !== "OK") {
        logDebugMessage("signInUpPOST: erroring out because preAuthChecks returned " + preAuthChecks.status);
        return AuthUtils.getErrorStatusResponseWithReason(
          preAuthChecks,
          errorCodeMap,
          "SIGN_IN_UP_NOT_ALLOWED"
        );
      }
      let response = await options.recipeImplementation.signInUp({
        thirdPartyId: provider.id,
        thirdPartyUserId: userInfo.thirdPartyUserId,
        email: emailInfo.id,
        isVerified: emailInfo.isVerified,
        oAuthTokens: oAuthTokensToUse,
        rawUserInfoFromProvider: userInfo.rawUserInfoFromProvider,
        session: input.session,
        tenantId,
        userContext
      });
      if (response.status === "SIGN_IN_UP_NOT_ALLOWED") {
        return response;
      }
      if (response.status !== "OK") {
        logDebugMessage("signInUpPOST: erroring out because signInUp returned " + response.status);
        return AuthUtils.getErrorStatusResponseWithReason(response, errorCodeMap, "SIGN_IN_UP_NOT_ALLOWED");
      }
      const postAuthChecks = await AuthUtils.postAuthChecks({
        factorId: "thirdparty",
        isSignUp,
        authenticatedUser: response.user,
        recipeUserId: response.recipeUserId,
        req: input.options.req,
        res: input.options.res,
        tenantId: input.tenantId,
        userContext: input.userContext,
        session: input.session
      });
      if (postAuthChecks.status !== "OK") {
        logDebugMessage("signInUpPOST: erroring out because postAuthChecks returned " + postAuthChecks.status);
        return AuthUtils.getErrorStatusResponseWithReason(
          postAuthChecks,
          errorCodeMap,
          "SIGN_IN_UP_NOT_ALLOWED"
        );
      }
      return {
        status: "OK",
        createdNewRecipeUser: response.createdNewRecipeUser,
        user: postAuthChecks.user,
        session: postAuthChecks.session,
        oAuthTokens: oAuthTokensToUse,
        rawUserInfoFromProvider: userInfo.rawUserInfoFromProvider
      };
    },
    appleRedirectHandlerPOST: async function({ formPostInfoFromProvider, options }) {
      const stateInBase64 = formPostInfoFromProvider.state;
      const state = Buffer2.from(stateInBase64, "base64").toString();
      const stateObj = JSON.parse(state);
      const redirectURI = stateObj.frontendRedirectURI;
      const urlObj = new URL(redirectURI);
      for (const [key, value] of Object.entries(formPostInfoFromProvider)) {
        urlObj.searchParams.set(key, `${value}`);
      }
      options.res.setHeader("Location", urlObj.toString(), false);
      options.res.setStatusCode(303);
      options.res.sendHTMLResponse("");
    }
  };
}
export {
  getAPIInterface as default
};