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
import SuperTokensError from "./error";
import Recipe from "./recipe";
import { getRequiredClaimValidators } from "./utils";
import { createNewSessionInRequest, getSessionFromRequest, refreshSessionInRequest } from "./sessionRequestFunctions";
import { getUser } from "../..";
import { DEFAULT_TENANT_ID } from "../multitenancy/constants";
import { protectedProps } from "./constants";
import { getUserContext } from "../../utils";
export default class SessionWrapper {
    static async createNewSession(
        req,
        res,
        tenantId,
        recipeUserId,
        accessTokenPayload = {},
        sessionDataInDatabase = {},
        userContext
    ) {
        const recipeInstance = Recipe.getInstanceOrThrowError();
        const config = recipeInstance.config;
        const appInfo = recipeInstance.getAppInfo();
        let user = await getUser(recipeUserId.getAsString(), userContext);
        let userId = recipeUserId.getAsString();
        if (user !== undefined) {
            userId = user.id;
        }
        return await createNewSessionInRequest({
            req,
            res,
            userContext: getUserContext(userContext),
            recipeInstance,
            accessTokenPayload,
            userId,
            recipeUserId,
            config,
            appInfo,
            sessionDataInDatabase,
            tenantId,
        });
    }
    static async createNewSessionWithoutRequestResponse(
        tenantId,
        recipeUserId,
        accessTokenPayload = {},
        sessionDataInDatabase = {},
        disableAntiCsrf = false,
        userContext
    ) {
        const ctx = getUserContext(userContext);
        const recipeInstance = Recipe.getInstanceOrThrowError();
        const claimsAddedByOtherRecipes = recipeInstance.getClaimsAddedByOtherRecipes();
        const appInfo = recipeInstance.getAppInfo();
        const issuer = appInfo.apiDomain.getAsStringDangerous() + appInfo.apiBasePath.getAsStringDangerous();
        let finalAccessTokenPayload = Object.assign(Object.assign({}, accessTokenPayload), { iss: issuer });
        for (const prop of protectedProps) {
            delete finalAccessTokenPayload[prop];
        }
        let user = await getUser(recipeUserId.getAsString(), ctx);
        let userId = recipeUserId.getAsString();
        if (user !== undefined) {
            userId = user.id;
        }
        for (const claim of claimsAddedByOtherRecipes) {
            const update = await claim.build(userId, recipeUserId, tenantId, finalAccessTokenPayload, ctx);
            finalAccessTokenPayload = Object.assign(Object.assign({}, finalAccessTokenPayload), update);
        }
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.createNewSession({
            userId,
            recipeUserId,
            accessTokenPayload: finalAccessTokenPayload,
            sessionDataInDatabase,
            disableAntiCsrf,
            tenantId,
            userContext: ctx,
        });
    }
    static async validateClaimsForSessionHandle(sessionHandle, overrideGlobalClaimValidators, userContext) {
        const ctx = getUserContext(userContext);
        const recipeImpl = Recipe.getInstanceOrThrowError().recipeInterfaceImpl;
        const sessionInfo = await recipeImpl.getSessionInformation({
            sessionHandle,
            userContext: ctx,
        });
        if (sessionInfo === undefined) {
            return {
                status: "SESSION_DOES_NOT_EXIST_ERROR",
            };
        }
        const claimValidatorsAddedByOtherRecipes = Recipe.getInstanceOrThrowError().getClaimValidatorsAddedByOtherRecipes();
        const globalClaimValidators = await recipeImpl.getGlobalClaimValidators({
            userId: sessionInfo.userId,
            recipeUserId: sessionInfo.recipeUserId,
            tenantId: sessionInfo.tenantId,
            claimValidatorsAddedByOtherRecipes,
            userContext: ctx,
        });
        const claimValidators =
            overrideGlobalClaimValidators !== undefined
                ? await overrideGlobalClaimValidators(globalClaimValidators, sessionInfo, ctx)
                : globalClaimValidators;
        let claimValidationResponse = await recipeImpl.validateClaims({
            userId: sessionInfo.userId,
            recipeUserId: sessionInfo.recipeUserId,
            accessTokenPayload: sessionInfo.customClaimsInAccessTokenPayload,
            claimValidators,
            userContext: ctx,
        });
        if (claimValidationResponse.accessTokenPayloadUpdate !== undefined) {
            if (
                !(await recipeImpl.mergeIntoAccessTokenPayload({
                    sessionHandle,
                    accessTokenPayloadUpdate: claimValidationResponse.accessTokenPayloadUpdate,
                    userContext: ctx,
                }))
            ) {
                return {
                    status: "SESSION_DOES_NOT_EXIST_ERROR",
                };
            }
        }
        return {
            status: "OK",
            invalidClaims: claimValidationResponse.invalidClaims,
        };
    }
    static async getSession(req, res, options, userContext) {
        const recipeInstance = Recipe.getInstanceOrThrowError();
        const config = recipeInstance.config;
        const recipeInterfaceImpl = recipeInstance.recipeInterfaceImpl;
        return getSessionFromRequest({
            req,
            res,
            recipeInterfaceImpl,
            config,
            options,
            userContext: getUserContext(userContext), // userContext is normalized inside the function
        });
    }
    static async getSessionWithoutRequestResponse(accessToken, antiCsrfToken, options, userContext) {
        const ctx = getUserContext(userContext);
        const recipeInterfaceImpl = Recipe.getInstanceOrThrowError().recipeInterfaceImpl;
        const session = await recipeInterfaceImpl.getSession({
            accessToken,
            antiCsrfToken,
            options,
            userContext: ctx,
        });
        if (session !== undefined) {
            const claimValidators = await getRequiredClaimValidators(
                session,
                options === null || options === void 0 ? void 0 : options.overrideGlobalClaimValidators,
                ctx
            );
            await session.assertClaims(claimValidators, ctx);
        }
        return session;
    }
    static getSessionInformation(sessionHandle, userContext) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getSessionInformation({
            sessionHandle,
            userContext: getUserContext(userContext),
        });
    }
    static refreshSession(req, res, userContext) {
        const recipeInstance = Recipe.getInstanceOrThrowError();
        const config = recipeInstance.config;
        const recipeInterfaceImpl = recipeInstance.recipeInterfaceImpl;
        return refreshSessionInRequest({
            res,
            req,
            userContext: getUserContext(userContext),
            config,
            recipeInterfaceImpl,
        });
    }
    static refreshSessionWithoutRequestResponse(refreshToken, disableAntiCsrf = false, antiCsrfToken, userContext) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.refreshSession({
            refreshToken,
            disableAntiCsrf,
            antiCsrfToken,
            userContext: getUserContext(userContext),
        });
    }
    static revokeAllSessionsForUser(userId, revokeSessionsForLinkedAccounts = true, tenantId, userContext) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.revokeAllSessionsForUser({
            userId,
            tenantId: tenantId === undefined ? DEFAULT_TENANT_ID : tenantId,
            revokeSessionsForLinkedAccounts,
            userContext: getUserContext(userContext),
        });
    }
    static getAllSessionHandlesForUser(userId, fetchSessionsForAllLinkedAccounts = true, tenantId, userContext) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getAllSessionHandlesForUser({
            userId,
            tenantId: tenantId === undefined ? DEFAULT_TENANT_ID : tenantId,
            fetchAcrossAllTenants: tenantId === undefined,
            fetchSessionsForAllLinkedAccounts,
            userContext: getUserContext(userContext),
        });
    }
    static revokeSession(sessionHandle, userContext) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.revokeSession({
            sessionHandle,
            userContext: getUserContext(userContext),
        });
    }
    static revokeMultipleSessions(sessionHandles, userContext) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.revokeMultipleSessions({
            sessionHandles,
            userContext: getUserContext(userContext),
        });
    }
    static updateSessionDataInDatabase(sessionHandle, newSessionData, userContext) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.updateSessionDataInDatabase({
            sessionHandle,
            newSessionData,
            userContext: getUserContext(userContext),
        });
    }
    static mergeIntoAccessTokenPayload(sessionHandle, accessTokenPayloadUpdate, userContext) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.mergeIntoAccessTokenPayload({
            sessionHandle,
            accessTokenPayloadUpdate,
            userContext: getUserContext(userContext),
        });
    }
    static createJWT(payload, validitySeconds, useStaticSigningKey, userContext) {
        return Recipe.getInstanceOrThrowError().openIdRecipe.recipeImplementation.createJWT({
            payload,
            validitySeconds,
            useStaticSigningKey,
            userContext: getUserContext(userContext),
        });
    }
    static getJWKS(userContext) {
        return Recipe.getInstanceOrThrowError().openIdRecipe.recipeImplementation.getJWKS({
            userContext: getUserContext(userContext),
        });
    }
    static getOpenIdDiscoveryConfiguration(userContext) {
        return Recipe.getInstanceOrThrowError().openIdRecipe.recipeImplementation.getOpenIdDiscoveryConfiguration({
            userContext: getUserContext(userContext),
        });
    }
    static fetchAndSetClaim(sessionHandle, claim, userContext) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.fetchAndSetClaim({
            sessionHandle,
            claim,
            userContext: getUserContext(userContext),
        });
    }
    static setClaimValue(sessionHandle, claim, value, userContext) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.setClaimValue({
            sessionHandle,
            claim,
            value,
            userContext: getUserContext(userContext),
        });
    }
    static getClaimValue(sessionHandle, claim, userContext) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getClaimValue({
            sessionHandle,
            claim,
            userContext: getUserContext(userContext),
        });
    }
    static removeClaim(sessionHandle, claim, userContext) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.removeClaim({
            sessionHandle,
            claim,
            userContext: getUserContext(userContext),
        });
    }
}
SessionWrapper.init = Recipe.init;
SessionWrapper.Error = SuperTokensError;
export let init = SessionWrapper.init;
export let createNewSession = SessionWrapper.createNewSession;
export let createNewSessionWithoutRequestResponse = SessionWrapper.createNewSessionWithoutRequestResponse;
export let getSession = SessionWrapper.getSession;
export let getSessionWithoutRequestResponse = SessionWrapper.getSessionWithoutRequestResponse;
export let getSessionInformation = SessionWrapper.getSessionInformation;
export let refreshSession = SessionWrapper.refreshSession;
export let refreshSessionWithoutRequestResponse = SessionWrapper.refreshSessionWithoutRequestResponse;
export let revokeAllSessionsForUser = SessionWrapper.revokeAllSessionsForUser;
export let getAllSessionHandlesForUser = SessionWrapper.getAllSessionHandlesForUser;
export let revokeSession = SessionWrapper.revokeSession;
export let revokeMultipleSessions = SessionWrapper.revokeMultipleSessions;
export let updateSessionDataInDatabase = SessionWrapper.updateSessionDataInDatabase;
export let mergeIntoAccessTokenPayload = SessionWrapper.mergeIntoAccessTokenPayload;
export let fetchAndSetClaim = SessionWrapper.fetchAndSetClaim;
export let setClaimValue = SessionWrapper.setClaimValue;
export let getClaimValue = SessionWrapper.getClaimValue;
export let removeClaim = SessionWrapper.removeClaim;
export let validateClaimsForSessionHandle = SessionWrapper.validateClaimsForSessionHandle;
export let Error = SessionWrapper.Error;
// JWT Functions
export let createJWT = SessionWrapper.createJWT;
export let getJWKS = SessionWrapper.getJWKS;
// Open id functions
export let getOpenIdDiscoveryConfiguration = SessionWrapper.getOpenIdDiscoveryConfiguration;
