import { sendUnauthorisedAccess, validateApiKey } from "../utils";
async function validateKey(_, options, userContext) {
  const input = { req: options.req, config: options.config, userContext };
  if (await validateApiKey(input)) {
    options.res.sendJSONResponse({
      status: "OK"
    });
  } else {
    sendUnauthorisedAccess(options.res);
  }
  return true;
}
export {
  validateKey as default
};
