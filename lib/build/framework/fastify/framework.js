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
import { getFromObjectCaseInsensitive, makeDefaultUserContextFromAPI, normaliseHttpMethod } from "../../utils";
import { BaseRequest } from "../request";
import { BaseResponse } from "../response";
import { serializeCookieValue, normalizeHeaderValue, getCookieValueFromHeaders } from "../utils";
import SuperTokens from "../../supertokens";
import { COOKIE_HEADER } from "../constants";
export class FastifyRequest extends BaseRequest {
    constructor(request) {
        super();
        this.getFormDataFromRequestBody = async () => {
            return this.request.body; // NOTE: ask user to add require('fastify-formbody')
        };
        this.getJSONFromRequestBody = async () => {
            return this.request.body;
        };
        this.getKeyValueFromQuery = (key) => {
            if (this.request.query === undefined) {
                return undefined;
            }
            let value = this.request.query[key];
            if (value === undefined || typeof value !== "string") {
                return undefined;
            }
            return value;
        };
        this.getMethod = () => {
            return normaliseHttpMethod(this.request.method);
        };
        this.getCookieValue = (key) => {
            return getCookieValueFromHeaders(this.request.headers, key);
        };
        this.getHeaderValue = (key) => {
            return normalizeHeaderValue(getFromObjectCaseInsensitive(key, this.request.headers));
        };
        this.getOriginalURL = () => {
            return this.request.url;
        };
        this.original = request;
        this.request = request;
    }
}
export class FastifyResponse extends BaseResponse {
    constructor(response) {
        super();
        this.sendHTMLResponse = (html) => {
            if (!this.response.sent) {
                this.response.type("text/html");
                this.response.send(html);
            }
        };
        this.setHeader = (key, value, allowDuplicateKey) => {
            try {
                let existingHeaders = this.response.getHeaders();
                let existingValue = existingHeaders[key.toLowerCase()];
                // we have the this.response.header for compatibility with nextJS
                if (existingValue === undefined) {
                    this.response.header(key, value);
                } else if (allowDuplicateKey) {
                    /**
                        We only want to append if it does not already exist
                        For example if the caller is trying to add front token to the access control exposed headers property
                        we do not want to append if something else had already added it
                    */
                    if (typeof existingValue !== "string" || !existingValue.includes(value)) {
                        this.response.header(key, existingValue + ", " + value);
                    }
                } else {
                    // we overwrite the current one with the new one
                    this.response.header(key, value);
                }
            } catch (err) {
                throw new Error("Error while setting header with key: " + key + " and value: " + value);
            }
        };
        this.removeHeader = (key) => {
            this.response.removeHeader(key);
        };
        this.setCookie = (key, value, domain, secure, httpOnly, expires, path, sameSite) => {
            let serialisedCookie = serializeCookieValue(key, value, domain, secure, httpOnly, expires, path, sameSite);
            let oldHeaders = this.response.getHeader(COOKIE_HEADER);
            if (oldHeaders === undefined) oldHeaders = [];
            else if (!(oldHeaders instanceof Array)) oldHeaders = [oldHeaders];
            this.response.removeHeader(COOKIE_HEADER);
            this.response.header(COOKIE_HEADER, [
                ...oldHeaders.filter((h) => !h.startsWith(key + "=")),
                serialisedCookie,
            ]);
        };
        /**
         * @param {number} statusCode
         */
        this.setStatusCode = (statusCode) => {
            if (!this.response.sent) {
                this.statusCode = statusCode;
            }
        };
        /**
         * @param {any} content
         */
        this.sendJSONResponse = (content) => {
            if (!this.response.sent) {
                this.response.statusCode = this.statusCode;
                this.response.send(content);
            }
        };
        this.original = response;
        this.response = response;
        this.statusCode = 200;
    }
}
function plugin(fastify, _, done) {
    fastify.addHook("preHandler", async (req, reply) => {
        let supertokens = SuperTokens.getInstanceOrThrowError();
        let request = new FastifyRequest(req);
        let response = new FastifyResponse(reply);
        const userContext = makeDefaultUserContextFromAPI(request);
        try {
            await supertokens.middleware(request, response, userContext);
        } catch (err) {
            await supertokens.errorHandler(err, request, response, userContext);
        }
    });
    done();
}
plugin[Symbol.for("skip-override")] = true;
export const errorHandler = () => {
    return async (err, req, res) => {
        let supertokens = SuperTokens.getInstanceOrThrowError();
        let request = new FastifyRequest(req);
        let response = new FastifyResponse(res);
        let userContext = makeDefaultUserContextFromAPI(request);
        await supertokens.errorHandler(err, request, response, userContext);
    };
};
export const FastifyWrapper = {
    plugin,
    errorHandler,
    wrapRequest: (unwrapped) => {
        return new FastifyRequest(unwrapped);
    },
    wrapResponse: (unwrapped) => {
        return new FastifyResponse(unwrapped);
    },
};
