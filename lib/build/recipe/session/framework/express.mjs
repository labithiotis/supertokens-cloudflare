import Session from "../recipe";
import { ExpressRequest, ExpressResponse } from "../../../framework/express/framework";
import SuperTokens from "../../../supertokens";
import { makeDefaultUserContextFromAPI } from "../../../utils";
function verifySession(options) {
  return async (req, res, next) => {
    const request = new ExpressRequest(req);
    const response = new ExpressResponse(res);
    const userContext = makeDefaultUserContextFromAPI(request);
    try {
      const sessionRecipe = Session.getInstanceOrThrowError();
      req.session = await sessionRecipe.verifySession(options, request, response, userContext);
      next();
    } catch (err) {
      try {
        const supertokens = SuperTokens.getInstanceOrThrowError();
        await supertokens.errorHandler(err, request, response, userContext);
      } catch (e) {
        next(err);
      }
    }
  };
}
export {
  verifySession
};
