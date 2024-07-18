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
import {
    setCookieForServerResponse,
    setHeaderForExpressLikeResponse,
    getCookieValueFromIncomingMessage,
    getHeaderValueFromIncomingMessage,
    assertThatBodyParserHasBeenUsedForExpressLikeRequest,
    assertFormDataBodyParserHasBeenUsedForExpressLikeRequest,
} from "../utils";
import SuperTokens from "../../supertokens";
import { Buffer } from "node:buffer";
export class ExpressRequest extends BaseRequest {
    constructor(request) {
        super();
        this.getFormDataFromRequestBody = async () => {
            await assertFormDataBodyParserHasBeenUsedForExpressLikeRequest(this.request);
            return this.request.body;
        };
        this.getJSONFromRequestBody = async () => {
            await assertThatBodyParserHasBeenUsedForExpressLikeRequest(this.getMethod(), this.request);
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
            return getCookieValueFromIncomingMessage(this.request, key);
        };
        this.getHeaderValue = (key) => {
            return getHeaderValueFromIncomingMessage(this.request, key);
        };
        this.getOriginalURL = () => {
            return this.request.originalUrl || this.request.url;
        };
        this.original = request;
        this.request = request;
    }
}
export class ExpressResponse extends BaseResponse {
    constructor(response) {
        super();
        this.sendHTMLResponse = (html) => {
            if (!this.response.writableEnded) {
                /**
                 * response.set method is not available if response
                 * is a nextjs response object. setHeader method
                 * is present on OutgoingMessage which is one of the
                 * bases used to construct response object for express
                 * like response as well as nextjs like response
                 */
                this.response.setHeader("Content-Type", "text/html");
                this.response.status(this.statusCode).send(Buffer.from(html));
            }
        };
        this.setHeader = (key, value, allowDuplicateKey) => {
            setHeaderForExpressLikeResponse(this.response, key, value, allowDuplicateKey);
        };
        this.removeHeader = (key) => {
            this.response.removeHeader(key);
        };
        this.setCookie = (key, value, domain, secure, httpOnly, expires, path, sameSite) => {
            setCookieForServerResponse(this.response, key, value, domain, secure, httpOnly, expires, path, sameSite);
        };
        /**
         * @param {number} statusCode
         */
        this.setStatusCode = (statusCode) => {
            if (!this.response.writableEnded) {
                this.statusCode = statusCode;
            }
        };
        this.sendJSONResponse = (content) => {
            if (!this.response.writableEnded) {
                this.response.status(this.statusCode).json(content);
            }
        };
        this.original = response;
        this.response = response;
        this.statusCode = 200;
    }
}
export const middleware = () => {
    return async (req, res, next) => {
        let supertokens;
        const request = new ExpressRequest(req);
        const response = new ExpressResponse(res);
        const userContext = makeDefaultUserContextFromAPI(request);
        try {
            supertokens = SuperTokens.getInstanceOrThrowError();
            const result = await supertokens.middleware(request, response, userContext);
            if (!result) {
                return next();
            }
        } catch (err) {
            if (supertokens) {
                try {
                    await supertokens.errorHandler(err, request, response, userContext);
                } catch (_a) {
                    next(err);
                }
            } else {
                next(err);
            }
        }
    };
};
export const errorHandler = () => {
    return async (err, req, res, next) => {
        let supertokens = SuperTokens.getInstanceOrThrowError();
        let request = new ExpressRequest(req);
        let response = new ExpressResponse(res);
        const userContext = makeDefaultUserContextFromAPI(request);
        try {
            await supertokens.errorHandler(err, request, response, userContext);
        } catch (err) {
            return next(err);
        }
    };
};
export const ExpressWrapper = {
    middleware,
    errorHandler,
    wrapRequest: (unwrapped) => {
        return new ExpressRequest(unwrapped);
    },
    wrapResponse: (unwrapped) => {
        return new ExpressResponse(unwrapped);
    },
};
