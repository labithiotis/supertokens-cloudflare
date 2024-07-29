import RecipeError from "./error";
import { logDebugMessage } from "../../logger";
import NormalisedURLPath from "../../normalisedURLPath";
import { Querier } from "../../querier";
import { normaliseHttpMethod } from "../../utils";
import { dashboardVersion } from "../../version";
import { DASHBOARD_ANALYTICS_API, SIGN_OUT_API } from "./constants";
import { validateApiKey } from "./utils";
function getRecipeImplementation() {
  return {
    getDashboardBundleLocation: async function() {
      return `https://cdn.jsdelivr.net/gh/supertokens/dashboard@v${dashboardVersion}/build/`;
    },
    shouldAllowAccess: async function(input) {
      var _a;
      if (!input.config.apiKey) {
        let querier = Querier.getNewInstanceOrThrowError(void 0);
        const authHeaderValue = (_a = input.req.getHeaderValue("authorization")) == null ? void 0 : _a.split(" ")[1];
        const sessionVerificationResponse = await querier.sendPostRequest(
          new NormalisedURLPath("/recipe/dashboard/session/verify"),
          {
            sessionId: authHeaderValue
          },
          input.userContext
        );
        if (sessionVerificationResponse.status !== "OK") {
          return false;
        }
        if (normaliseHttpMethod(input.req.getMethod()) !== "get") {
          if (input.req.getOriginalURL().endsWith(DASHBOARD_ANALYTICS_API)) {
            return true;
          }
          if (input.req.getOriginalURL().endsWith(SIGN_OUT_API)) {
            return true;
          }
          const admins = input.config.admins;
          if (admins === void 0) {
            return true;
          }
          if (admins.length === 0) {
            logDebugMessage("User Dashboard: Throwing OPERATION_NOT_ALLOWED because user is not an admin");
            throw new RecipeError();
          }
          const userEmail = sessionVerificationResponse.email;
          if (userEmail === void 0 || typeof userEmail !== "string") {
            logDebugMessage(
              "User Dashboard: Returning Unauthorised because no email was returned from the core. Should never come here"
            );
            return false;
          }
          if (!admins.includes(userEmail)) {
            logDebugMessage("User Dashboard: Throwing OPERATION_NOT_ALLOWED because user is not an admin");
            throw new RecipeError();
          }
        }
        return true;
      }
      return await validateApiKey(input);
    }
  };
}
export {
  getRecipeImplementation as default
};
