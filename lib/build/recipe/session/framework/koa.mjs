import SuperTokens from "../../../supertokens";
import Session from "../recipe";
import { KoaRequest, KoaResponse } from "../../../framework/koa/framework";
import { makeDefaultUserContextFromAPI } from "../../../utils";
function verifySession(options) {
  return async (ctx, next) => {
    let sessionRecipe = Session.getInstanceOrThrowError();
    let request = new KoaRequest(ctx);
    let response = new KoaResponse(ctx);
    const userContext = makeDefaultUserContextFromAPI(request);
    try {
      ctx.session = await sessionRecipe.verifySession(options, request, response, userContext);
    } catch (err) {
      try {
        const supertokens = SuperTokens.getInstanceOrThrowError();
        await supertokens.errorHandler(err, request, response, userContext);
        return;
      } catch (e) {
        throw err;
      }
    }
    await next();
  };
}
export {
  verifySession
};
