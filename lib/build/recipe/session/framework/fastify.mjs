import Session from "../recipe";
import { FastifyRequest, FastifyResponse } from "../../../framework/fastify/framework";
import SuperTokens from "../../../supertokens";
import { makeDefaultUserContextFromAPI } from "../../../utils";
function verifySession(options) {
  return async (req, res) => {
    let sessionRecipe = Session.getInstanceOrThrowError();
    let request = new FastifyRequest(req);
    let response = new FastifyResponse(res);
    const userContext = makeDefaultUserContextFromAPI(request);
    try {
      req.session = await sessionRecipe.verifySession(options, request, response, userContext);
    } catch (err) {
      const supertokens = SuperTokens.getInstanceOrThrowError();
      await supertokens.errorHandler(err, request, response, userContext);
      throw err;
    }
  };
}
export {
  verifySession
};
