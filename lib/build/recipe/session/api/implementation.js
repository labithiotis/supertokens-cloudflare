import { normaliseHttpMethod } from "../../../utils";
import NormalisedURLPath from "../../../normalisedURLPath";
import { getSessionFromRequest, refreshSessionInRequest } from "../sessionRequestFunctions";
export default function getAPIInterface() {
    return {
        refreshPOST: async function ({ options, userContext, }) {
            return refreshSessionInRequest({
                req: options.req,
                res: options.res,
                userContext,
                config: options.config,
                recipeInterfaceImpl: options.recipeImplementation,
            });
        },
        verifySession: async function ({ verifySessionOptions, options, userContext, }) {
            let method = normaliseHttpMethod(options.req.getMethod());
            if (method === "options" || method === "trace") {
                return undefined;
            }
            let incomingPath = new NormalisedURLPath(options.req.getOriginalURL());
            let refreshTokenPath = options.config.refreshTokenPath;
            if (incomingPath.equals(refreshTokenPath) && method === "post") {
                return refreshSessionInRequest({
                    req: options.req,
                    res: options.res,
                    userContext,
                    config: options.config,
                    recipeInterfaceImpl: options.recipeImplementation,
                });
            }
            else {
                return getSessionFromRequest({
                    req: options.req,
                    res: options.res,
                    options: verifySessionOptions,
                    config: options.config,
                    recipeInterfaceImpl: options.recipeImplementation,
                    userContext,
                });
            }
        },
        signOutPOST: async function ({ session, userContext, }) {
            await session.revokeSession(userContext);
            return {
                status: "OK",
            };
        },
    };
}
