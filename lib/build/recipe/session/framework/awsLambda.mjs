import { AWSRequest, AWSResponse } from "../../../framework/awsLambda/framework";
import SuperTokens from "../../../supertokens";
import Session from "../recipe";
import { makeDefaultUserContextFromAPI } from "../../../utils";
function verifySession(handler, verifySessionOptions) {
  return async (event, context, callback) => {
    let supertokens = SuperTokens.getInstanceOrThrowError();
    let request = new AWSRequest(event);
    let response = new AWSResponse(event);
    const userContext = makeDefaultUserContextFromAPI(request);
    try {
      let sessionRecipe = Session.getInstanceOrThrowError();
      event.session = await sessionRecipe.verifySession(verifySessionOptions, request, response, userContext);
      let handlerResult = await handler(event, context, callback);
      return response.sendResponse(handlerResult);
    } catch (err) {
      await supertokens.errorHandler(err, request, response, userContext);
      if (response.responseSet) {
        return response.sendResponse({});
      }
      throw err;
    }
  };
}
export {
  verifySession
};
