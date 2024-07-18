import STError from "../../../../error";
import Session from "../../../session";
export const userSessionsPost = async (_, ___, options, userContext) => {
    const requestBody = await options.req.getJSONBody();
    const sessionHandles = requestBody.sessionHandles;
    if (sessionHandles === undefined || !Array.isArray(sessionHandles)) {
        throw new STError({
            message: "Required parameter 'sessionHandles' is missing or has an invalid type",
            type: STError.BAD_INPUT_ERROR,
        });
    }
    await Session.revokeMultipleSessions(sessionHandles, userContext);
    return {
        status: "OK",
    };
};
