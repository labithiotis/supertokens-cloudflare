// @ts-nocheck
import RecipeModule from "./recipeModule";
import NormalisedURLDomain from "./normalisedURLDomain";
import NormalisedURLPath from "./normalisedURLPath";
import type { TypeFramework } from "./framework/types";
import type { RecipeLevelUser } from "./recipe/accountlinking/types";
import { BaseRequest } from "./framework";
declare const __brand: unique symbol;
type Brand<B> = {
    [__brand]: B;
};
type Branded<T, B> = T & Brand<B>;
export type UserContext = Branded<Record<string, any>, "UserContext">;
export type AppInfo = {
    appName: string;
    websiteDomain?: string;
    origin?: string | ((input: {
        request: BaseRequest | undefined;
        userContext: UserContext;
    }) => string);
    websiteBasePath?: string;
    apiDomain: string;
    apiBasePath?: string;
    apiGatewayPath?: string;
};
export type NormalisedAppinfo = {
    appName: string;
    getOrigin: (input: {
        request: BaseRequest | undefined;
        userContext: UserContext;
    }) => NormalisedURLDomain;
    apiDomain: NormalisedURLDomain;
    topLevelAPIDomain: string;
    getTopLevelWebsiteDomain: (input: {
        request: BaseRequest | undefined;
        userContext: UserContext;
    }) => string;
    apiBasePath: NormalisedURLPath;
    apiGatewayPath: NormalisedURLPath;
    websiteBasePath: NormalisedURLPath;
};
export type SuperTokensInfo = {
    connectionURI: string;
    apiKey?: string;
    networkInterceptor?: NetworkInterceptor;
    disableCoreCallCache?: boolean;
};
export type TypeInput = {
    supertokens?: SuperTokensInfo;
    framework?: TypeFramework;
    appInfo: AppInfo;
    recipeList: RecipeListFunction[];
    telemetry?: boolean;
    isInServerlessEnv?: boolean;
    debug?: boolean;
};
export type NetworkInterceptor = (request: HttpRequest, userContext: UserContext) => HttpRequest;
export interface HttpRequest {
    url: string;
    method: HTTPMethod;
    headers: {
        [key: string]: string | number | string[];
    };
    params?: Record<string, boolean | number | string | undefined>;
    body?: any;
}
export type RecipeListFunction = (appInfo: NormalisedAppinfo, isInServerlessEnv: boolean) => RecipeModule;
export type APIHandled = {
    pathWithoutApiBasePath: NormalisedURLPath;
    method: HTTPMethod;
    id: string;
    disabled: boolean;
};
export type HTTPMethod = "post" | "get" | "delete" | "put" | "options" | "trace";
export type JSONPrimitive = string | number | boolean | null;
export type JSONArray = Array<JSONValue>;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray | undefined;
export interface JSONObject {
    [ind: string]: JSONValue;
}
export type GeneralErrorResponse = {
    status: "GENERAL_ERROR";
    message: string;
};
export type User = {
    id: string;
    timeJoined: number;
    isPrimaryUser: boolean;
    tenantIds: string[];
    emails: string[];
    phoneNumbers: string[];
    thirdParty: {
        id: string;
        userId: string;
    }[];
    loginMethods: (RecipeLevelUser & {
        verified: boolean;
        hasSameEmailAs: (email: string | undefined) => boolean;
        hasSamePhoneNumberAs: (phoneNumber: string | undefined) => boolean;
        hasSameThirdPartyInfoAs: (thirdParty?: {
            id: string;
            userId: string;
        }) => boolean;
        toJson: () => any;
    })[];
    toJson: () => any;
};
export {};
