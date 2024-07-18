/* Copyright (c) 2021, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */
import { makeDefaultUserContextFromAPI, normaliseHttpMethod } from "../../utils";
import { BaseRequest } from "../request";
import { BaseResponse } from "../response";
import { getHeaderValueFromIncomingMessage, parseJSONBodyFromRequest, parseURLEncodedFormData } from "../utils";
import SuperTokens from "../../supertokens";
export class KoaRequest extends BaseRequest {
    constructor(ctx) {
        super();
        this.getFormDataFromRequestBody = async () => {
            return parseURLEncodedFormData(this.ctx.req);
        };
        this.getJSONFromRequestBody = async () => {
            const parsedJSONBody = await parseJSONBodyFromRequest(this.ctx.req);
            return parsedJSONBody === undefined ? {} : parsedJSONBody;
        };
        this.getKeyValueFromQuery = (key) => {
            if (this.ctx.query === undefined) {
                return undefined;
            }
            let value = this.ctx.request.query[key];
            if (value === undefined || typeof value !== "string") {
                return undefined;
            }
            return value;
        };
        this.getMethod = () => {
            return normaliseHttpMethod(this.ctx.request.method);
        };
        this.getCookieValue = (key) => {
            return this.ctx.cookies.get(key);
        };
        this.getHeaderValue = (key) => {
            return getHeaderValueFromIncomingMessage(this.ctx.req, key);
        };
        this.getOriginalURL = () => {
            return this.ctx.originalUrl;
        };
        this.original = ctx;
        this.ctx = ctx;
    }
}
export class KoaResponse extends BaseResponse {
    constructor(ctx) {
        super();
        this.responseSet = false;
        this.statusSet = false;
        this.sendHTMLResponse = (html) => {
            if (!this.responseSet) {
                this.ctx.set("content-type", "text/html");
                this.ctx.body = html;
                this.responseSet = true;
            }
        };
        this.setHeader = (key, value, allowDuplicateKey) => {
            try {
                let existingHeaders = this.ctx.response.headers;
                let existingValue = existingHeaders[key.toLowerCase()];
                if (existingValue === undefined) {
                    this.ctx.set(key, value);
                } else if (allowDuplicateKey) {
                    /**
                        We only want to append if it does not already exist
                        For example if the caller is trying to add front token to the access control exposed headers property
                        we do not want to append if something else had already added it
                    */
                    if (typeof existingValue !== "string" || !existingValue.includes(value)) {
                        this.ctx.set(key, existingValue + ", " + value);
                    }
                } else {
                    // we overwrite the current one with the new one
                    this.ctx.set(key, value);
                }
            } catch (err) {
                throw new Error("Error while setting header with key: " + key + " and value: " + value);
            }
        };
        this.removeHeader = (key) => {
            this.ctx.remove(key);
        };
        this.setCookie = (key, value, domain, secure, httpOnly, expires, path, sameSite) => {
            this.ctx.cookies.set(key, value, {
                secure,
                sameSite,
                httpOnly,
                expires: new Date(expires),
                domain,
                path,
                overwrite: true,
            });
        };
        /**
         * @param {number} statusCode
         */
        this.setStatusCode = (statusCode) => {
            if (!this.statusSet) {
                this.ctx.status = statusCode;
                this.statusSet = true;
            }
        };
        this.sendJSONResponse = (content) => {
            if (!this.responseSet) {
                this.ctx.body = content;
                this.responseSet = true;
            }
        };
        this.original = ctx;
        this.ctx = ctx;
    }
}
export const middleware = () => {
    return async (ctx, next) => {
        let supertokens = SuperTokens.getInstanceOrThrowError();
        let request = new KoaRequest(ctx);
        let response = new KoaResponse(ctx);
        const userContext = makeDefaultUserContextFromAPI(request);
        try {
            let result = await supertokens.middleware(request, response, userContext);
            if (!result) {
                return await next();
            }
        } catch (err) {
            return await supertokens.errorHandler(err, request, response, userContext);
        }
    };
};
export const KoaWrapper = {
    middleware,
    wrapRequest: (unwrapped) => {
        return new KoaRequest(unwrapped);
    },
    wrapResponse: (unwrapped) => {
        return new KoaResponse(unwrapped);
    },
};
