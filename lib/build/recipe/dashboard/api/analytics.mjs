import SuperTokens from "../../../supertokens";
import { Querier } from "../../../querier";
import NormalisedURLPath from "../../../normalisedURLPath";
import { version as SDKVersion } from "../../../version";
import STError from "../../../error";
import { doFetch } from "../../../utils";
async function analyticsPost(_, ___, options, userContext) {
  if (!SuperTokens.getInstanceOrThrowError().telemetryEnabled) {
    return {
      status: "OK"
    };
  }
  const { email, dashboardVersion } = await options.req.getJSONBody();
  if (email === void 0) {
    throw new STError({
      message: "Missing required property 'email'",
      type: STError.BAD_INPUT_ERROR
    });
  }
  if (dashboardVersion === void 0) {
    throw new STError({
      message: "Missing required property 'dashboardVersion'",
      type: STError.BAD_INPUT_ERROR
    });
  }
  let telemetryId;
  let numberOfUsers;
  try {
    let querier = Querier.getNewInstanceOrThrowError(options.recipeId);
    let response = await querier.sendGetRequest(new NormalisedURLPath("/telemetry"), {}, userContext);
    if (response.exists) {
      telemetryId = response.telemetryId;
    }
    numberOfUsers = await SuperTokens.getInstanceOrThrowError().getUserCount(void 0, void 0, userContext);
  } catch (_2) {
    return {
      status: "OK"
    };
  }
  const { apiDomain, getOrigin: websiteDomain, appName } = options.appInfo;
  const data = {
    websiteDomain: websiteDomain({
      request: void 0,
      userContext
    }).getAsStringDangerous(),
    apiDomain: apiDomain.getAsStringDangerous(),
    appName,
    sdk: "node",
    sdkVersion: SDKVersion,
    telemetryId,
    numberOfUsers,
    email,
    dashboardVersion
  };
  try {
    await doFetch("https://api.supertokens.com/0/st/telemetry", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "api-version": "3",
        "content-type": "application/json; charset=utf-8"
      }
    });
  } catch (e) {
  }
  return {
    status: "OK"
  };
}
export {
  analyticsPost as default
};
