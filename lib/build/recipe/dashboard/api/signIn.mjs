import { send200Response } from "../../../utils";
import STError from "../../../error";
import { Querier } from "../../../querier";
import NormalisedURLPath from "../../../normalisedURLPath";
async function signIn(_, options, userContext) {
  const { email, password } = await options.req.getJSONBody();
  if (email === void 0) {
    throw new STError({
      message: "Missing required parameter 'email'",
      type: STError.BAD_INPUT_ERROR
    });
  }
  if (password === void 0) {
    throw new STError({
      message: "Missing required parameter 'password'",
      type: STError.BAD_INPUT_ERROR
    });
  }
  let querier = Querier.getNewInstanceOrThrowError(void 0);
  const signInResponse = await querier.sendPostRequest(
    new NormalisedURLPath("/recipe/dashboard/signin"),
    {
      email,
      password
    },
    userContext
  );
  send200Response(options.res, signInResponse);
  return true;
}
export {
  signIn as default
};
