var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
import { logDebugMessage } from "../../../logger";
import { AuthUtils } from "../../../authUtils";
import { FactorIds } from "../../multifactorauth";
import AccountLinking from "../../accountlinking/recipe";
import EmailVerification from "../../emailverification/recipe";
import { getEnabledPwlessFactors } from "../utils";
import { getUser, listUsersByAccountInfo } from "../../..";
import SessionError from "../../session/error";
function getAPIImplementation() {
  return {
    consumeCodePOST: async function(input) {
      var _a, _b, _c;
      const errorCodeMap = {
        SIGN_UP_NOT_ALLOWED: "Cannot sign in / up due to security reasons. Please try a different login method or contact support. (ERR_CODE_002)",
        SIGN_IN_NOT_ALLOWED: "Cannot sign in / up due to security reasons. Please try a different login method or contact support. (ERR_CODE_003)",
        LINKING_TO_SESSION_USER_FAILED: {
          // We should never get an email verification error here, since pwless automatically marks the user
          // email as verified
          RECIPE_USER_ID_ALREADY_LINKED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR: "Cannot sign in / up due to security reasons. Please contact support. (ERR_CODE_017)",
          ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR: "Cannot sign in / up due to security reasons. Please contact support. (ERR_CODE_018)",
          SESSION_USER_ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR: "Cannot sign in / up due to security reasons. Please contact support. (ERR_CODE_019)"
        }
      };
      const deviceInfo = await input.options.recipeImplementation.listCodesByPreAuthSessionId({
        tenantId: input.tenantId,
        preAuthSessionId: input.preAuthSessionId,
        userContext: input.userContext
      });
      if (!deviceInfo) {
        return {
          status: "RESTART_FLOW_ERROR"
        };
      }
      const recipeId = "passwordless";
      const accountInfo = deviceInfo.phoneNumber !== void 0 ? {
        phoneNumber: deviceInfo.phoneNumber
      } : {
        email: deviceInfo.email
      };
      let checkCredentialsResponseProm;
      let checkCredentials = async () => {
        if (checkCredentialsResponseProm === void 0) {
          checkCredentialsResponseProm = input.options.recipeImplementation.checkCode(
            "deviceId" in input ? {
              preAuthSessionId: input.preAuthSessionId,
              deviceId: input.deviceId,
              userInputCode: input.userInputCode,
              tenantId: input.tenantId,
              userContext: input.userContext
            } : {
              preAuthSessionId: input.preAuthSessionId,
              linkCode: input.linkCode,
              tenantId: input.tenantId,
              userContext: input.userContext
            }
          );
        }
        const checkCredentialsResponse = await checkCredentialsResponseProm;
        return checkCredentialsResponse.status === "OK";
      };
      const authenticatingUser = await AuthUtils.getAuthenticatingUserAndAddToCurrentTenantIfRequired({
        accountInfo,
        recipeId,
        userContext: input.userContext,
        session: input.session,
        tenantId: input.tenantId,
        checkCredentialsOnTenant: checkCredentials
      });
      const emailVerificationInstance = EmailVerification.getInstance();
      if (accountInfo.email !== void 0 && input.session !== void 0 && emailVerificationInstance !== void 0) {
        const sessionUser = await getUser(input.session.getUserId(), input.userContext);
        if (sessionUser === void 0) {
          throw new SessionError({
            type: SessionError.UNAUTHORISED,
            message: "Session user not found"
          });
        }
        const loginMethod = sessionUser.loginMethods.find(
          (lm) => lm.recipeUserId.getAsString() === input.session.getRecipeUserId().getAsString()
        );
        if (loginMethod === void 0) {
          throw new SessionError({
            type: SessionError.UNAUTHORISED,
            message: "Session user and session recipeUserId is inconsistent"
          });
        }
        if (loginMethod.hasSameEmailAs(accountInfo.email) && !loginMethod.verified) {
          if (await checkCredentials()) {
            const tokenResponse = await emailVerificationInstance.recipeInterfaceImpl.createEmailVerificationToken(
              {
                tenantId: input.tenantId,
                recipeUserId: loginMethod.recipeUserId,
                email: accountInfo.email,
                userContext: input.userContext
              }
            );
            if (tokenResponse.status === "OK") {
              await emailVerificationInstance.recipeInterfaceImpl.verifyEmailUsingToken({
                tenantId: input.tenantId,
                token: tokenResponse.token,
                attemptAccountLinking: false,
                // we pass false here cause
                // we anyway do account linking in this API after this function is
                // called.
                userContext: input.userContext
              });
            }
          }
        }
      }
      let factorId;
      if (deviceInfo.email !== void 0) {
        if ("userInputCode" in input) {
          factorId = FactorIds.OTP_EMAIL;
        } else {
          factorId = FactorIds.LINK_EMAIL;
        }
      } else {
        if ("userInputCode" in input) {
          factorId = FactorIds.OTP_PHONE;
        } else {
          factorId = FactorIds.LINK_PHONE;
        }
      }
      const isSignUp = authenticatingUser === void 0;
      const preAuthChecks = await AuthUtils.preAuthChecks({
        authenticatingAccountInfo: {
          recipeId: "passwordless",
          email: deviceInfo.email,
          phoneNumber: deviceInfo.phoneNumber
        },
        factorIds: [factorId],
        authenticatingUser: authenticatingUser == null ? void 0 : authenticatingUser.user,
        isSignUp,
        isVerified: (_a = authenticatingUser == null ? void 0 : authenticatingUser.loginMethod.verified) != null ? _a : true,
        signInVerifiesLoginMethod: true,
        skipSessionUserUpdateInCore: false,
        tenantId: input.tenantId,
        userContext: input.userContext,
        session: input.session
      });
      if (preAuthChecks.status !== "OK") {
        return AuthUtils.getErrorStatusResponseWithReason(
          preAuthChecks,
          errorCodeMap,
          "SIGN_IN_UP_NOT_ALLOWED"
        );
      }
      if (checkCredentialsResponseProm !== void 0) {
        const checkCredentialsResponse = await checkCredentialsResponseProm;
        if (checkCredentialsResponse.status !== "OK") {
          return checkCredentialsResponse;
        }
      }
      let response = await input.options.recipeImplementation.consumeCode(
        "deviceId" in input ? {
          preAuthSessionId: input.preAuthSessionId,
          deviceId: input.deviceId,
          userInputCode: input.userInputCode,
          session: input.session,
          tenantId: input.tenantId,
          userContext: input.userContext
        } : {
          preAuthSessionId: input.preAuthSessionId,
          linkCode: input.linkCode,
          session: input.session,
          tenantId: input.tenantId,
          userContext: input.userContext
        }
      );
      if (response.status === "RESTART_FLOW_ERROR" || response.status === "INCORRECT_USER_INPUT_CODE_ERROR" || response.status === "EXPIRED_USER_INPUT_CODE_ERROR") {
        return response;
      }
      if (response.status !== "OK") {
        return AuthUtils.getErrorStatusResponseWithReason(response, errorCodeMap, "SIGN_IN_UP_NOT_ALLOWED");
      }
      const postAuthChecks = await AuthUtils.postAuthChecks({
        factorId,
        isSignUp,
        authenticatedUser: (_b = response.user) != null ? _b : authenticatingUser.user,
        recipeUserId: (_c = response.recipeUserId) != null ? _c : authenticatingUser.loginMethod.recipeUserId,
        req: input.options.req,
        res: input.options.res,
        tenantId: input.tenantId,
        userContext: input.userContext,
        session: input.session
      });
      if (postAuthChecks.status !== "OK") {
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
        session: postAuthChecks.session
      };
    },
    createCodePOST: async function(input) {
      var _a;
      const errorCodeMap = {
        SIGN_UP_NOT_ALLOWED: "Cannot sign in / up due to security reasons. Please try a different login method or contact support. (ERR_CODE_002)",
        LINKING_TO_SESSION_USER_FAILED: {
          SESSION_USER_ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR: "Cannot sign in / up due to security reasons. Please contact support. (ERR_CODE_019)"
        }
      };
      const accountInfo = {};
      if ("email" in input) {
        accountInfo.email = input.email;
      }
      if ("phoneNumber" in input) {
        accountInfo.phoneNumber = input.phoneNumber;
      }
      const userWithMatchingLoginMethod = await getPasswordlessUserByAccountInfo(__spreadProps(__spreadValues({}, input), { accountInfo }));
      let factorIds;
      if (input.session !== void 0) {
        if (accountInfo.email !== void 0) {
          factorIds = [FactorIds.OTP_EMAIL];
        } else {
          factorIds = [FactorIds.OTP_PHONE];
        }
      } else {
        factorIds = getEnabledPwlessFactors(input.options.config);
        if (accountInfo.email !== void 0) {
          factorIds = factorIds.filter(
            (factor) => [FactorIds.OTP_EMAIL, FactorIds.LINK_EMAIL].includes(factor)
          );
        } else {
          factorIds = factorIds.filter(
            (factor) => [FactorIds.OTP_PHONE, FactorIds.LINK_PHONE].includes(factor)
          );
        }
      }
      const preAuthChecks = await AuthUtils.preAuthChecks({
        authenticatingAccountInfo: __spreadProps(__spreadValues({}, accountInfo), {
          recipeId: "passwordless"
        }),
        isSignUp: userWithMatchingLoginMethod === void 0,
        authenticatingUser: userWithMatchingLoginMethod == null ? void 0 : userWithMatchingLoginMethod.user,
        isVerified: (_a = userWithMatchingLoginMethod == null ? void 0 : userWithMatchingLoginMethod.loginMethod.verified) != null ? _a : true,
        signInVerifiesLoginMethod: true,
        skipSessionUserUpdateInCore: true,
        tenantId: input.tenantId,
        factorIds,
        userContext: input.userContext,
        session: input.session
      });
      if (preAuthChecks.status !== "OK") {
        return AuthUtils.getErrorStatusResponseWithReason(
          preAuthChecks,
          errorCodeMap,
          "SIGN_IN_UP_NOT_ALLOWED"
        );
      }
      let response = await input.options.recipeImplementation.createCode(
        "email" in input ? {
          userContext: input.userContext,
          email: input.email,
          userInputCode: input.options.config.getCustomUserInputCode === void 0 ? void 0 : await input.options.config.getCustomUserInputCode(
            input.tenantId,
            input.userContext
          ),
          session: input.session,
          tenantId: input.tenantId
        } : {
          userContext: input.userContext,
          phoneNumber: input.phoneNumber,
          userInputCode: input.options.config.getCustomUserInputCode === void 0 ? void 0 : await input.options.config.getCustomUserInputCode(
            input.tenantId,
            input.userContext
          ),
          session: input.session,
          tenantId: input.tenantId
        }
      );
      if (response.status !== "OK") {
        return AuthUtils.getErrorStatusResponseWithReason(response, {}, "SIGN_IN_UP_NOT_ALLOWED");
      }
      let magicLink = void 0;
      let userInputCode = void 0;
      let flowType = input.options.config.flowType;
      if (preAuthChecks.validFactorIds.every((id) => id.startsWith("link"))) {
        flowType = "MAGIC_LINK";
      } else if (preAuthChecks.validFactorIds.every((id) => id.startsWith("otp"))) {
        flowType = "USER_INPUT_CODE";
      } else {
        flowType = "USER_INPUT_CODE_AND_MAGIC_LINK";
      }
      if (flowType === "MAGIC_LINK" || flowType === "USER_INPUT_CODE_AND_MAGIC_LINK") {
        magicLink = input.options.appInfo.getOrigin({
          request: input.options.req,
          userContext: input.userContext
        }).getAsStringDangerous() + input.options.appInfo.websiteBasePath.getAsStringDangerous() + "/verify?preAuthSessionId=" + response.preAuthSessionId + "&tenantId=" + input.tenantId + "#" + response.linkCode;
      }
      if (flowType === "USER_INPUT_CODE" || flowType === "USER_INPUT_CODE_AND_MAGIC_LINK") {
        userInputCode = response.userInputCode;
      }
      if (input.options.config.contactMethod === "PHONE" || input.options.config.contactMethod === "EMAIL_OR_PHONE" && "phoneNumber" in input) {
        logDebugMessage(`Sending passwordless login SMS to ${input.phoneNumber}`);
        await input.options.smsDelivery.ingredientInterfaceImpl.sendSms({
          type: "PASSWORDLESS_LOGIN",
          isFirstFactor: preAuthChecks.isFirstFactor,
          codeLifetime: response.codeLifetime,
          phoneNumber: input.phoneNumber,
          preAuthSessionId: response.preAuthSessionId,
          urlWithLinkCode: magicLink,
          userInputCode,
          tenantId: input.tenantId,
          userContext: input.userContext
        });
      } else {
        logDebugMessage(`Sending passwordless login email to ${input.email}`);
        await input.options.emailDelivery.ingredientInterfaceImpl.sendEmail({
          type: "PASSWORDLESS_LOGIN",
          isFirstFactor: preAuthChecks.isFirstFactor,
          email: input.email,
          codeLifetime: response.codeLifetime,
          preAuthSessionId: response.preAuthSessionId,
          urlWithLinkCode: magicLink,
          userInputCode,
          tenantId: input.tenantId,
          userContext: input.userContext
        });
      }
      return {
        status: "OK",
        deviceId: response.deviceId,
        flowType,
        preAuthSessionId: response.preAuthSessionId
      };
    },
    emailExistsGET: async function(input) {
      const users = await AccountLinking.getInstance().recipeInterfaceImpl.listUsersByAccountInfo({
        tenantId: input.tenantId,
        accountInfo: {
          email: input.email
        },
        doUnionOfAccountInfo: false,
        userContext: input.userContext
      });
      const userExists = users.some(
        (u) => u.loginMethods.some((lm) => lm.recipeId === "passwordless" && lm.hasSameEmailAs(input.email))
      );
      return {
        exists: userExists,
        status: "OK"
      };
    },
    phoneNumberExistsGET: async function(input) {
      let users = await listUsersByAccountInfo(
        input.tenantId,
        {
          phoneNumber: input.phoneNumber
          // tenantId: input.tenantId,
        },
        false,
        input.userContext
      );
      return {
        exists: users.length > 0,
        status: "OK"
      };
    },
    resendCodePOST: async function(input) {
      let deviceInfo = await input.options.recipeImplementation.listCodesByDeviceId({
        userContext: input.userContext,
        deviceId: input.deviceId,
        tenantId: input.tenantId
      });
      if (deviceInfo === void 0) {
        return {
          status: "RESTART_FLOW_ERROR"
        };
      }
      if (input.options.config.contactMethod === "PHONE" && deviceInfo.phoneNumber === void 0 || input.options.config.contactMethod === "EMAIL" && deviceInfo.email === void 0) {
        return {
          status: "RESTART_FLOW_ERROR"
        };
      }
      const userWithMatchingLoginMethod = await getPasswordlessUserByAccountInfo(__spreadProps(__spreadValues({}, input), {
        accountInfo: deviceInfo
      }));
      const authTypeInfo = await AuthUtils.checkAuthTypeAndLinkingStatus(
        input.session,
        {
          recipeId: "passwordless",
          email: deviceInfo.email,
          phoneNumber: deviceInfo.phoneNumber
        },
        userWithMatchingLoginMethod == null ? void 0 : userWithMatchingLoginMethod.user,
        true,
        input.userContext
      );
      if (authTypeInfo.status === "LINKING_TO_SESSION_USER_FAILED") {
        return {
          status: "RESTART_FLOW_ERROR"
        };
      }
      let numberOfTriesToCreateNewCode = 0;
      while (true) {
        numberOfTriesToCreateNewCode++;
        let response = await input.options.recipeImplementation.createNewCodeForDevice({
          userContext: input.userContext,
          deviceId: input.deviceId,
          userInputCode: input.options.config.getCustomUserInputCode === void 0 ? void 0 : await input.options.config.getCustomUserInputCode(input.tenantId, input.userContext),
          tenantId: input.tenantId
        });
        if (response.status === "USER_INPUT_CODE_ALREADY_USED_ERROR") {
          if (numberOfTriesToCreateNewCode >= 3) {
            return {
              status: "GENERAL_ERROR",
              message: "Failed to generate a one time code. Please try again"
            };
          }
          continue;
        }
        if (response.status === "OK") {
          let magicLink = void 0;
          let userInputCode = void 0;
          let factorIds;
          if (input.session !== void 0) {
            if (deviceInfo.email !== void 0) {
              factorIds = [FactorIds.OTP_EMAIL];
            } else {
              factorIds = [FactorIds.OTP_PHONE];
            }
          } else {
            factorIds = getEnabledPwlessFactors(input.options.config);
            factorIds = await AuthUtils.filterOutInvalidFirstFactorsOrThrowIfAllAreInvalid(
              factorIds,
              input.tenantId,
              false,
              input.userContext
            );
          }
          let flowType = input.options.config.flowType;
          if (factorIds.every((id) => id.startsWith("link"))) {
            flowType = "MAGIC_LINK";
          } else if (factorIds.every((id) => id.startsWith("otp"))) {
            flowType = "USER_INPUT_CODE";
          } else {
            flowType = "USER_INPUT_CODE_AND_MAGIC_LINK";
          }
          if (flowType === "MAGIC_LINK" || flowType === "USER_INPUT_CODE_AND_MAGIC_LINK") {
            magicLink = input.options.appInfo.getOrigin({
              request: input.options.req,
              userContext: input.userContext
            }).getAsStringDangerous() + input.options.appInfo.websiteBasePath.getAsStringDangerous() + "/verify?preAuthSessionId=" + response.preAuthSessionId + "&tenantId=" + input.tenantId + "#" + response.linkCode;
          }
          if (flowType === "USER_INPUT_CODE" || flowType === "USER_INPUT_CODE_AND_MAGIC_LINK") {
            userInputCode = response.userInputCode;
          }
          if (input.options.config.contactMethod === "PHONE" || input.options.config.contactMethod === "EMAIL_OR_PHONE" && deviceInfo.phoneNumber !== void 0) {
            logDebugMessage(`Sending passwordless login SMS to ${input.phoneNumber}`);
            await input.options.smsDelivery.ingredientInterfaceImpl.sendSms({
              type: "PASSWORDLESS_LOGIN",
              isFirstFactor: authTypeInfo.isFirstFactor,
              codeLifetime: response.codeLifetime,
              phoneNumber: deviceInfo.phoneNumber,
              preAuthSessionId: response.preAuthSessionId,
              urlWithLinkCode: magicLink,
              userInputCode,
              tenantId: input.tenantId,
              userContext: input.userContext
            });
          } else {
            logDebugMessage(`Sending passwordless login email to ${input.email}`);
            await input.options.emailDelivery.ingredientInterfaceImpl.sendEmail({
              type: "PASSWORDLESS_LOGIN",
              isFirstFactor: authTypeInfo.isFirstFactor,
              email: deviceInfo.email,
              codeLifetime: response.codeLifetime,
              preAuthSessionId: response.preAuthSessionId,
              urlWithLinkCode: magicLink,
              userInputCode,
              tenantId: input.tenantId,
              userContext: input.userContext
            });
          }
        }
        return {
          status: response.status
        };
      }
    }
  };
}
async function getPasswordlessUserByAccountInfo(input) {
  const existingUsers = await AccountLinking.getInstance().recipeInterfaceImpl.listUsersByAccountInfo({
    tenantId: input.tenantId,
    accountInfo: input.accountInfo,
    doUnionOfAccountInfo: false,
    userContext: input.userContext
  });
  logDebugMessage(
    `getPasswordlessUserByAccountInfo got ${existingUsers.length} from core resp ${JSON.stringify(
      input.accountInfo
    )}`
  );
  const usersWithMatchingLoginMethods = existingUsers.map((user) => ({
    user,
    loginMethod: user.loginMethods.find(
      (lm) => lm.recipeId === "passwordless" && (lm.hasSameEmailAs(input.accountInfo.email) || lm.hasSamePhoneNumberAs(input.accountInfo.phoneNumber))
    )
  })).filter(({ loginMethod }) => loginMethod !== void 0);
  logDebugMessage(
    `getPasswordlessUserByAccountInfo ${usersWithMatchingLoginMethods.length} has matching login methods`
  );
  if (usersWithMatchingLoginMethods.length > 1) {
    throw new Error(
      "This should never happen: multiple users exist matching the accountInfo in passwordless createCode"
    );
  }
  return usersWithMatchingLoginMethods[0];
}
export {
  getAPIImplementation as default
};
