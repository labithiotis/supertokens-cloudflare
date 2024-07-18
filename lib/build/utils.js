import { parse } from "tldts";
import NormalisedURLDomain from "./normalisedURLDomain";
import NormalisedURLPath from "./normalisedURLPath";
import { logDebugMessage } from "./logger";
import { HEADER_FDI, HEADER_RID } from "./constants";
import crossFetch from "cross-fetch";
import { ProcessState, PROCESS_STATE } from "./processState";
export const doFetch = async (input, init) => {
    // frameworks like nextJS cache fetch GET requests (https://nextjs.org/docs/app/building-your-application/caching#data-cache)
    // we don't want that because it may lead to weird behaviour when querying the core.
    if (init === undefined) {
        ProcessState.getInstance().addState(PROCESS_STATE.ADDING_NO_CACHE_HEADER_IN_FETCH);
        init = {
            cache: "no-cache",
        };
    } else {
        if (init.cache === undefined) {
            ProcessState.getInstance().addState(PROCESS_STATE.ADDING_NO_CACHE_HEADER_IN_FETCH);
            init.cache = "no-cache";
        }
    }
    const fetchFunction = typeof fetch !== "undefined" ? fetch : crossFetch;
    try {
        return await fetchFunction(input, init);
    } catch (e) {
        // Cloudflare Workers don't support the 'cache' field in RequestInit.
        // To work around this, we delete the 'cache' field and retry the fetch if the error is due to the missing 'cache' field.
        // Remove this workaround once the 'cache' field is supported.
        // More info: https://github.com/cloudflare/workerd/issues/698
        const unimplementedCacheError =
            e &&
            typeof e === "object" &&
            "message" in e &&
            e.message === "The 'cache' field on 'RequestInitializerDict' is not implemented.";
        if (!unimplementedCacheError) throw e;
        const newOpts = Object.assign({}, init);
        delete newOpts.cache;
        return await fetchFunction(input, newOpts);
    }
};
export function getLargestVersionFromIntersection(v1, v2) {
    let intersection = v1.filter((value) => v2.indexOf(value) !== -1);
    if (intersection.length === 0) {
        return undefined;
    }
    let maxVersionSoFar = intersection[0];
    for (let i = 1; i < intersection.length; i++) {
        maxVersionSoFar = maxVersion(intersection[i], maxVersionSoFar);
    }
    return maxVersionSoFar;
}
export function maxVersion(version1, version2) {
    let splittedv1 = version1.split(".");
    let splittedv2 = version2.split(".");
    let minLength = Math.min(splittedv1.length, splittedv2.length);
    for (let i = 0; i < minLength; i++) {
        let v1 = Number(splittedv1[i]);
        let v2 = Number(splittedv2[i]);
        if (v1 > v2) {
            return version1;
        } else if (v2 > v1) {
            return version2;
        }
    }
    if (splittedv1.length >= splittedv2.length) {
        return version1;
    }
    return version2;
}
export function normaliseInputAppInfoOrThrowError(appInfo) {
    if (appInfo === undefined) {
        throw new Error("Please provide the appInfo object when calling supertokens.init");
    }
    if (appInfo.apiDomain === undefined) {
        throw new Error("Please provide your apiDomain inside the appInfo object when calling supertokens.init");
    }
    if (appInfo.appName === undefined) {
        throw new Error("Please provide your appName inside the appInfo object when calling supertokens.init");
    }
    let apiGatewayPath =
        appInfo.apiGatewayPath !== undefined
            ? new NormalisedURLPath(appInfo.apiGatewayPath)
            : new NormalisedURLPath("");
    if (appInfo.origin === undefined && appInfo.websiteDomain === undefined) {
        throw new Error(
            "Please provide either origin or websiteDomain inside the appInfo object when calling supertokens.init"
        );
    }
    let websiteDomainFunction = (input) => {
        let origin = appInfo.origin;
        if (origin === undefined) {
            origin = appInfo.websiteDomain;
        }
        // This should not be possible because we check for either origin or websiteDomain above
        if (origin === undefined) {
            throw new Error("Should never come here");
        }
        if (typeof origin === "function") {
            origin = origin(input);
        }
        return new NormalisedURLDomain(origin);
    };
    const apiDomain = new NormalisedURLDomain(appInfo.apiDomain);
    const topLevelAPIDomain = getTopLevelDomainForSameSiteResolution(apiDomain.getAsStringDangerous());
    const topLevelWebsiteDomain = (input) => {
        return getTopLevelDomainForSameSiteResolution(websiteDomainFunction(input).getAsStringDangerous());
    };
    return {
        appName: appInfo.appName,
        getOrigin: websiteDomainFunction,
        apiDomain,
        apiBasePath: apiGatewayPath.appendPath(
            appInfo.apiBasePath === undefined
                ? new NormalisedURLPath("/auth")
                : new NormalisedURLPath(appInfo.apiBasePath)
        ),
        websiteBasePath:
            appInfo.websiteBasePath === undefined
                ? new NormalisedURLPath("/auth")
                : new NormalisedURLPath(appInfo.websiteBasePath),
        apiGatewayPath,
        topLevelAPIDomain,
        getTopLevelWebsiteDomain: topLevelWebsiteDomain,
    };
}
export function normaliseHttpMethod(method) {
    return method.toLowerCase();
}
export function sendNon200ResponseWithMessage(res, message, statusCode) {
    sendNon200Response(res, statusCode, { message });
}
export function sendNon200Response(res, statusCode, body) {
    if (statusCode < 300) {
        throw new Error("Calling sendNon200Response with status code < 300");
    }
    logDebugMessage("Sending response to client with status code: " + statusCode);
    res.setStatusCode(statusCode);
    res.sendJSONResponse(body);
}
export function send200Response(res, responseJson) {
    logDebugMessage("Sending response to client with status code: 200");
    responseJson = deepTransform(responseJson);
    res.setStatusCode(200);
    res.sendJSONResponse(responseJson);
}
// this function tries to convert the json response based on the toJson function
// defined in the objects in the input. This is primarily used to convert the RecipeUserId
// type to a string type before sending it to the client.
function deepTransform(obj) {
    let out = Array.isArray(obj) ? [] : {};
    for (let key in obj) {
        let val = obj[key];
        if (val && typeof val === "object" && val["toJson"] !== undefined && typeof val["toJson"] === "function") {
            out[key] = val.toJson();
        } else if (val && typeof val === "object") {
            out[key] = deepTransform(val);
        } else {
            out[key] = val;
        }
    }
    return out;
}
export function isAnIpAddress(ipaddress) {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
        ipaddress
    );
}
export function getBackwardsCompatibleUserInfo(req, result, userContext) {
    let resp;
    // (>= 1.18 && < 2.0) || >= 3.0: This is because before 1.18, and between 2 and 3, FDI does not
    // support account linking.
    if (
        (hasGreaterThanEqualToFDI(req, "1.18") && !hasGreaterThanEqualToFDI(req, "2.0")) ||
        hasGreaterThanEqualToFDI(req, "3.0")
    ) {
        resp = {
            user: result.user.toJson(),
        };
        if (result.createdNewRecipeUser !== undefined) {
            resp.createdNewRecipeUser = result.createdNewRecipeUser;
        }
        return resp;
    } else {
        let loginMethod = result.user.loginMethods.find(
            (lm) => lm.recipeUserId.getAsString() === result.session.getRecipeUserId(userContext).getAsString()
        );
        if (loginMethod === undefined) {
            // we pick the oldest login method here for the user.
            // this can happen in case the user is implementing something like
            // MFA where the session remains the same during the second factor as well.
            for (let i = 0; i < result.user.loginMethods.length; i++) {
                if (loginMethod === undefined) {
                    loginMethod = result.user.loginMethods[i];
                } else if (loginMethod.timeJoined > result.user.loginMethods[i].timeJoined) {
                    loginMethod = result.user.loginMethods[i];
                }
            }
        }
        if (loginMethod === undefined) {
            throw new Error("This should never happen - user has no login methods");
        }
        const userObj = {
            id: result.user.id,
            timeJoined: loginMethod.timeJoined,
        };
        if (loginMethod.thirdParty) {
            userObj.thirdParty = loginMethod.thirdParty;
        }
        if (loginMethod.email) {
            userObj.email = loginMethod.email;
        }
        if (loginMethod.phoneNumber) {
            userObj.phoneNumber = loginMethod.phoneNumber;
        }
        resp = {
            user: userObj,
        };
        if (result.createdNewRecipeUser !== undefined) {
            resp.createdNewUser = result.createdNewRecipeUser;
        }
    }
    return resp;
}
export function getLatestFDIVersionFromFDIList(fdiHeaderValue) {
    let versions = fdiHeaderValue.split(",");
    let maxVersionStr = versions[0];
    for (let i = 1; i < versions.length; i++) {
        maxVersionStr = maxVersion(maxVersionStr, versions[i]);
    }
    return maxVersionStr;
}
export function hasGreaterThanEqualToFDI(req, version) {
    let requestFDI = req.getHeaderValue(HEADER_FDI);
    if (requestFDI === undefined) {
        // By default we assume they want to use the latest FDI, this also helps with tests
        return true;
    }
    requestFDI = getLatestFDIVersionFromFDIList(requestFDI);
    if (requestFDI === version || maxVersion(version, requestFDI) !== version) {
        return true;
    }
    return false;
}
export function getRidFromHeader(req) {
    return req.getHeaderValue(HEADER_RID);
}
export function frontendHasInterceptor(req) {
    return getRidFromHeader(req) !== undefined;
}
export function humaniseMilliseconds(ms) {
    let t = Math.floor(ms / 1000);
    let suffix = "";
    if (t < 60) {
        if (t > 1) suffix = "s";
        return `${t} second${suffix}`;
    } else if (t < 3600) {
        const m = Math.floor(t / 60);
        if (m > 1) suffix = "s";
        return `${m} minute${suffix}`;
    } else {
        const h = Math.floor(t / 360) / 10;
        if (h > 1) suffix = "s";
        return `${h} hour${suffix}`;
    }
}
export function makeDefaultUserContextFromAPI(request) {
    return setRequestInUserContextIfNotDefined({}, request);
}
export function getUserContext(inputUserContext) {
    return inputUserContext !== null && inputUserContext !== void 0 ? inputUserContext : {};
}
export function setRequestInUserContextIfNotDefined(userContext, request) {
    if (userContext === undefined) {
        userContext = {};
    }
    if (userContext._default === undefined) {
        userContext._default = {};
    }
    if (typeof userContext._default === "object") {
        userContext._default.request = request;
        userContext._default.keepCacheAlive = true;
    }
    return userContext;
}
export function getTopLevelDomainForSameSiteResolution(url) {
    let urlObj = new URL(url);
    let hostname = urlObj.hostname;
    if (hostname.startsWith("localhost") || hostname.startsWith("localhost.org") || isAnIpAddress(hostname)) {
        // we treat these as the same TLDs since we can use sameSite lax for all of them.
        return "localhost";
    }
    let parsedURL = parse(hostname);
    if (parsedURL.domain === null) {
        if (hostname.endsWith(".amazonaws.com") && parsedURL.publicSuffix === hostname) {
            return hostname;
        }
        // support for .local domain
        if (hostname.endsWith(".local") && parsedURL.publicSuffix === null) {
            return hostname;
        }
        throw new Error("Please make sure that the apiDomain and websiteDomain have correct values");
    }
    return parsedURL.domain;
}
export function getFromObjectCaseInsensitive(key, object) {
    const matchedKeys = Object.keys(object).filter((i) => i.toLocaleLowerCase() === key.toLocaleLowerCase());
    if (matchedKeys.length === 0) {
        return undefined;
    }
    return object[matchedKeys[0]];
}
export async function postWithFetch(url, headers, body, { successLog, errorLogHeader }) {
    let error;
    let resp;
    try {
        const fetchResp = await doFetch(url, {
            method: "POST",
            body: JSON.stringify(body),
            headers,
        });
        const respText = await fetchResp.text();
        resp = {
            status: fetchResp.status,
            body: JSON.parse(respText),
        };
        if (fetchResp.status < 300) {
            logDebugMessage(successLog);
            return { resp };
        }
        logDebugMessage(errorLogHeader);
        logDebugMessage(`Error status: ${fetchResp.status}`);
        logDebugMessage(`Error response: ${respText}`);
    } catch (caught) {
        error = caught;
        logDebugMessage(errorLogHeader);
        if (error instanceof Error) {
            logDebugMessage(`Error: ${error.message}`);
        } else {
            logDebugMessage(`Error: ${JSON.stringify(error)}`);
        }
    }
    logDebugMessage("Logging the input below:");
    logDebugMessage(JSON.stringify(body, null, 2));
    if (error !== undefined) {
        return {
            error,
        };
    }
    return {
        resp: resp,
    };
}
export function normaliseEmail(email) {
    email = email.trim();
    email = email.toLowerCase();
    return email;
}
