"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var implementation_exports = {};
__export(implementation_exports, {
  default: () => getAPIImplementation
});
module.exports = __toCommonJS(implementation_exports);
var import_logger = require("../../../logger");
var import_authUtils = require("../../../authUtils");
var import_multifactorauth = require("../../multifactorauth");
var import_recipe = __toESM(require("../../accountlinking/recipe"), 1);
var import_recipe2 = __toESM(require("../../emailverification/recipe"), 1);
var import_utils = require("../utils");
var import__ = require("../../..");
var import_error = __toESM(require("../../session/error"), 1);
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
      const authenticatingUser = await import_authUtils.AuthUtils.getAuthenticatingUserAndAddToCurrentTenantIfRequired({
        accountInfo,
        recipeId,
        userContext: input.userContext,
        session: input.session,
        tenantId: input.tenantId,
        checkCredentialsOnTenant: checkCredentials
      });
      const emailVerificationInstance = import_recipe2.default.getInstance();
      if (accountInfo.email !== void 0 && input.session !== void 0 && emailVerificationInstance !== void 0) {
        const sessionUser = await (0, import__.getUser)(input.session.getUserId(), input.userContext);
        if (sessionUser === void 0) {
          throw new import_error.default({
            type: import_error.default.UNAUTHORISED,
            message: "Session user not found"
          });
        }
        const loginMethod = sessionUser.loginMethods.find(
          (lm) => lm.recipeUserId.getAsString() === input.session.getRecipeUserId().getAsString()
        );
        if (loginMethod === void 0) {
          throw new import_error.default({
            type: import_error.default.UNAUTHORISED,
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
          factorId = import_multifactorauth.FactorIds.OTP_EMAIL;
        } else {
          factorId = import_multifactorauth.FactorIds.LINK_EMAIL;
        }
      } else {
        if ("userInputCode" in input) {
          factorId = import_multifactorauth.FactorIds.OTP_PHONE;
        } else {
          factorId = import_multifactorauth.FactorIds.LINK_PHONE;
        }
      }
      const isSignUp = authenticatingUser === void 0;
      const preAuthChecks = await import_authUtils.AuthUtils.preAuthChecks({
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
        return import_authUtils.AuthUtils.getErrorStatusResponseWithReason(
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
        return import_authUtils.AuthUtils.getErrorStatusResponseWithReason(response, errorCodeMap, "SIGN_IN_UP_NOT_ALLOWED");
      }
      const postAuthChecks = await import_authUtils.AuthUtils.postAuthChecks({
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
        return import_authUtils.AuthUtils.getErrorStatusResponseWithReason(
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
          factorIds = [import_multifactorauth.FactorIds.OTP_EMAIL];
        } else {
          factorIds = [import_multifactorauth.FactorIds.OTP_PHONE];
        }
      } else {
        factorIds = (0, import_utils.getEnabledPwlessFactors)(input.options.config);
        if (accountInfo.email !== void 0) {
          factorIds = factorIds.filter(
            (factor) => [import_multifactorauth.FactorIds.OTP_EMAIL, import_multifactorauth.FactorIds.LINK_EMAIL].includes(factor)
          );
        } else {
          factorIds = factorIds.filter(
            (factor) => [import_multifactorauth.FactorIds.OTP_PHONE, import_multifactorauth.FactorIds.LINK_PHONE].includes(factor)
          );
        }
      }
      const preAuthChecks = await import_authUtils.AuthUtils.preAuthChecks({
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
        return import_authUtils.AuthUtils.getErrorStatusResponseWithReason(
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
        return import_authUtils.AuthUtils.getErrorStatusResponseWithReason(response, {}, "SIGN_IN_UP_NOT_ALLOWED");
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
        (0, import_logger.logDebugMessage)(`Sending passwordless login SMS to ${input.phoneNumber}`);
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
        (0, import_logger.logDebugMessage)(`Sending passwordless login email to ${input.email}`);
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
      const users = await import_recipe.default.getInstance().recipeInterfaceImpl.listUsersByAccountInfo({
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
      let users = await (0, import__.listUsersByAccountInfo)(
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
      const authTypeInfo = await import_authUtils.AuthUtils.checkAuthTypeAndLinkingStatus(
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
              factorIds = [import_multifactorauth.FactorIds.OTP_EMAIL];
            } else {
              factorIds = [import_multifactorauth.FactorIds.OTP_PHONE];
            }
          } else {
            factorIds = (0, import_utils.getEnabledPwlessFactors)(input.options.config);
            factorIds = await import_authUtils.AuthUtils.filterOutInvalidFirstFactorsOrThrowIfAllAreInvalid(
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
            (0, import_logger.logDebugMessage)(`Sending passwordless login SMS to ${input.phoneNumber}`);
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
            (0, import_logger.logDebugMessage)(`Sending passwordless login email to ${input.email}`);
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
  const existingUsers = await import_recipe.default.getInstance().recipeInterfaceImpl.listUsersByAccountInfo({
    tenantId: input.tenantId,
    accountInfo: input.accountInfo,
    doUnionOfAccountInfo: false,
    userContext: input.userContext
  });
  (0, import_logger.logDebugMessage)(
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
  (0, import_logger.logDebugMessage)(
    `getPasswordlessUserByAccountInfo ${usersWithMatchingLoginMethods.length} has matching login methods`
  );
  if (usersWithMatchingLoginMethods.length > 1) {
    throw new Error(
      "This should never happen: multiple users exist matching the accountInfo in passwordless createCode"
    );
  }
  return usersWithMatchingLoginMethods[0];
}
