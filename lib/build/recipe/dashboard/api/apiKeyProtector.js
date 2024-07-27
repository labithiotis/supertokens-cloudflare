import RecipeError from "../error";
import { sendUnauthorisedAccess } from "../utils";
export default async function apiKeyProtector(apiImplementation, tenantId, options, apiFunction, userContext) {
    let shouldAllowAccess = false;
    try {
        shouldAllowAccess = await options.recipeImplementation.shouldAllowAccess({
            req: options.req,
            config: options.config,
            userContext,
        });
    }
    catch (e) {
        if (RecipeError.isErrorFromSuperTokens(e) && e.type === RecipeError.OPERATION_NOT_ALLOWED) {
            options.res.setStatusCode(403);
            options.res.sendJSONResponse({
                message: e.message,
            });
            return true;
        }
        throw e;
    }
    if (!shouldAllowAccess) {
        sendUnauthorisedAccess(options.res);
        return true;
    }
    const response = await apiFunction(apiImplementation, tenantId, options, userContext);
    options.res.sendJSONResponse(response);
    return true;
}
