import SuperTokens from "../../../supertokens";
import Session from "../recipe";
import { HapiRequest, HapiResponse } from "../../../framework/hapi/framework";
import { makeDefaultUserContextFromAPI } from "../../../utils";
function verifySession(options) {
  return async (req, h) => {
    let sessionRecipe = Session.getInstanceOrThrowError();
    let request = new HapiRequest(req);
    let response = new HapiResponse(h);
    const userContext = makeDefaultUserContextFromAPI(request);
    try {
      req.session = await sessionRecipe.verifySession(options, request, response, userContext);
    } catch (err) {
      try {
        const supertokens = SuperTokens.getInstanceOrThrowError();
        await supertokens.errorHandler(err, request, response, userContext);
        if (response.responseSet) {
          let resObj = response.sendResponse(true);
          (req.app.lazyHeaders || []).forEach(({ key, value, allowDuplicateKey }) => {
            resObj.header(key, value, { append: allowDuplicateKey });
          });
          return resObj.takeover();
        }
      } catch (e) {
        throw err;
      }
    }
    return h.continue;
  };
}
export {
  verifySession
};
