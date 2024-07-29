import SuperTokens from "../../../supertokens";
import Session from "../recipe";
import { LoopbackRequest, LoopbackResponse } from "../../../framework/loopback/framework";
import { makeDefaultUserContextFromAPI } from "../../../utils";
function verifySession(options) {
  return async (ctx, next) => {
    let sessionRecipe = Session.getInstanceOrThrowError();
    let middlewareCtx = await ctx.get("middleware.http.context");
    let request = new LoopbackRequest(middlewareCtx);
    let response = new LoopbackResponse(middlewareCtx);
    const userContext = makeDefaultUserContextFromAPI(request);
    try {
      middlewareCtx.session = await sessionRecipe.verifySession(
        options,
        request,
        response,
        userContext
      );
    } catch (err) {
      try {
        const supertokens = SuperTokens.getInstanceOrThrowError();
        await supertokens.errorHandler(err, request, response, userContext);
        return;
      } catch (e) {
        throw err;
      }
    }
    return await next();
  };
}
export {
  verifySession
};
