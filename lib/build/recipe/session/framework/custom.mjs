import Session from "../recipe";
import SuperTokens from "../../../supertokens";
import { makeDefaultUserContextFromAPI } from "../../../utils";
function verifySession(options) {
  return async (req, res, next) => {
    const userContext = makeDefaultUserContextFromAPI(req);
    try {
      const sessionRecipe = Session.getInstanceOrThrowError();
      req.session = await sessionRecipe.verifySession(options, req, res, userContext);
      if (next !== void 0) {
        next();
      }
      return void 0;
    } catch (err) {
      try {
        const supertokens = SuperTokens.getInstanceOrThrowError();
        await supertokens.errorHandler(err, req, res, userContext);
        return void 0;
      } catch (e) {
        if (next !== void 0) {
          next(err);
        }
        return err;
      }
    }
  };
}
export {
  verifySession
};
