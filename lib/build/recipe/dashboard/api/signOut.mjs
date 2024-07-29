import { send200Response } from "../../../utils";
import { Querier } from "../../../querier";
import NormalisedURLPath from "../../../normalisedURLPath";
async function signOut(_, ___, options, userContext) {
  var _a;
  if (options.config.authMode === "api-key") {
    send200Response(options.res, { status: "OK" });
  } else {
    const sessionIdFormAuthHeader = (_a = options.req.getHeaderValue("authorization")) == null ? void 0 : _a.split(" ")[1];
    let querier = Querier.getNewInstanceOrThrowError(void 0);
    const sessionDeleteResponse = await querier.sendDeleteRequest(
      new NormalisedURLPath("/recipe/dashboard/session"),
      {},
      { sessionId: sessionIdFormAuthHeader },
      userContext
    );
    send200Response(options.res, sessionDeleteResponse);
  }
  return true;
}
export {
  signOut as default
};
