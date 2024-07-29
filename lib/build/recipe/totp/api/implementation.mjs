import MultiFactorAuth from "../../multifactorauth";
import MultiFactorAuthRecipe from "../../multifactorauth/recipe";
import SessionError from "../../session/error";
function getAPIInterface() {
  return {
    createDevicePOST: async function({ deviceName, options, session, userContext }) {
      const userId = session.getUserId();
      let mfaInstance = MultiFactorAuthRecipe.getInstance();
      if (mfaInstance === void 0) {
        throw new Error("should never come here");
      }
      await MultiFactorAuth.assertAllowedToSetupFactorElseThrowInvalidClaimError(session, "totp", userContext);
      const createDeviceRes = await options.recipeImplementation.createDevice({
        userId,
        deviceName,
        userContext
      });
      if (createDeviceRes.status === "UNKNOWN_USER_ID_ERROR") {
        throw new SessionError({
          type: SessionError.UNAUTHORISED,
          message: "Session user not found"
        });
      } else {
        return createDeviceRes;
      }
    },
    listDevicesGET: async function({ options, session, userContext }) {
      const userId = session.getUserId();
      return await options.recipeImplementation.listDevices({
        userId,
        userContext
      });
    },
    removeDevicePOST: async function({ deviceName, options, session, userContext }) {
      const userId = session.getUserId();
      return await options.recipeImplementation.removeDevice({
        userId,
        deviceName,
        userContext
      });
    },
    verifyDevicePOST: async function({ deviceName, totp, options, session, userContext }) {
      const userId = session.getUserId();
      const tenantId = session.getTenantId();
      const mfaInstance = MultiFactorAuthRecipe.getInstance();
      if (mfaInstance === void 0) {
        throw new Error("should never come here");
      }
      await MultiFactorAuth.assertAllowedToSetupFactorElseThrowInvalidClaimError(session, "totp", userContext);
      const res = await options.recipeImplementation.verifyDevice({
        tenantId,
        userId,
        deviceName,
        totp,
        userContext
      });
      if (res.status === "OK") {
        await mfaInstance.recipeInterfaceImpl.markFactorAsCompleteInSession({
          session,
          factorId: "totp",
          userContext
        });
      }
      return res;
    },
    verifyTOTPPOST: async function({ totp, options, session, userContext }) {
      const userId = session.getUserId();
      const tenantId = session.getTenantId();
      const mfaInstance = MultiFactorAuthRecipe.getInstance();
      if (mfaInstance === void 0) {
        throw new Error("should never come here");
      }
      const res = await options.recipeImplementation.verifyTOTP({
        tenantId,
        userId,
        totp,
        userContext
      });
      if (res.status === "OK") {
        await mfaInstance.recipeInterfaceImpl.markFactorAsCompleteInSession({
          session,
          factorId: "totp",
          userContext
        });
      }
      return res;
    }
  };
}
export {
  getAPIInterface as default
};
