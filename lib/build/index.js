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
import SuperTokens from "./supertokens";
import SuperTokensError from "./error";
import AccountLinking from "./recipe/accountlinking/recipe";
import RecipeUserId from "./recipeUserId";
import { User } from "./user";
import { getUserContext } from "./utils";
// For Express
export default class SuperTokensWrapper {
    static getAllCORSHeaders() {
        return SuperTokens.getInstanceOrThrowError().getAllCORSHeaders();
    }
    static getUserCount(includeRecipeIds, tenantId, userContext) {
        return SuperTokens.getInstanceOrThrowError().getUserCount(
            includeRecipeIds,
            tenantId,
            getUserContext(userContext)
        );
    }
    static getUsersOldestFirst(input) {
        return AccountLinking.getInstance().recipeInterfaceImpl.getUsers(
            Object.assign(Object.assign({ timeJoinedOrder: "ASC" }, input), {
                userContext: getUserContext(input.userContext),
            })
        );
    }
    static getUsersNewestFirst(input) {
        return AccountLinking.getInstance().recipeInterfaceImpl.getUsers(
            Object.assign(Object.assign({ timeJoinedOrder: "DESC" }, input), {
                userContext: getUserContext(input.userContext),
            })
        );
    }
    static createUserIdMapping(input) {
        return SuperTokens.getInstanceOrThrowError().createUserIdMapping(
            Object.assign(Object.assign({}, input), { userContext: getUserContext(input.userContext) })
        );
    }
    static getUserIdMapping(input) {
        return SuperTokens.getInstanceOrThrowError().getUserIdMapping(
            Object.assign(Object.assign({}, input), { userContext: getUserContext(input.userContext) })
        );
    }
    static deleteUserIdMapping(input) {
        return SuperTokens.getInstanceOrThrowError().deleteUserIdMapping(
            Object.assign(Object.assign({}, input), { userContext: getUserContext(input.userContext) })
        );
    }
    static updateOrDeleteUserIdMappingInfo(input) {
        return SuperTokens.getInstanceOrThrowError().updateOrDeleteUserIdMappingInfo(
            Object.assign(Object.assign({}, input), { userContext: getUserContext(input.userContext) })
        );
    }
    static async getUser(userId, userContext) {
        return await AccountLinking.getInstance().recipeInterfaceImpl.getUser({
            userId,
            userContext: getUserContext(userContext),
        });
    }
    static async listUsersByAccountInfo(tenantId, accountInfo, doUnionOfAccountInfo = false, userContext) {
        return await AccountLinking.getInstance().recipeInterfaceImpl.listUsersByAccountInfo({
            tenantId,
            accountInfo,
            doUnionOfAccountInfo,
            userContext: getUserContext(userContext),
        });
    }
    static async deleteUser(userId, removeAllLinkedAccounts = true, userContext) {
        return await AccountLinking.getInstance().recipeInterfaceImpl.deleteUser({
            userId,
            removeAllLinkedAccounts,
            userContext: getUserContext(userContext),
        });
    }
    static convertToRecipeUserId(recipeUserId) {
        return new RecipeUserId(recipeUserId);
    }
    static getRequestFromUserContext(userContext) {
        return SuperTokens.getInstanceOrThrowError().getRequestFromUserContext(userContext);
    }
}
SuperTokensWrapper.init = SuperTokens.init;
SuperTokensWrapper.Error = SuperTokensError;
SuperTokensWrapper.RecipeUserId = RecipeUserId;
SuperTokensWrapper.User = User;
export let init = SuperTokensWrapper.init;
export let getAllCORSHeaders = SuperTokensWrapper.getAllCORSHeaders;
export let getUserCount = SuperTokensWrapper.getUserCount;
export let getUsersOldestFirst = SuperTokensWrapper.getUsersOldestFirst;
export let getUsersNewestFirst = SuperTokensWrapper.getUsersNewestFirst;
export let deleteUser = SuperTokensWrapper.deleteUser;
export let createUserIdMapping = SuperTokensWrapper.createUserIdMapping;
export let getUserIdMapping = SuperTokensWrapper.getUserIdMapping;
export let deleteUserIdMapping = SuperTokensWrapper.deleteUserIdMapping;
export let updateOrDeleteUserIdMappingInfo = SuperTokensWrapper.updateOrDeleteUserIdMappingInfo;
export let getUser = SuperTokensWrapper.getUser;
export let listUsersByAccountInfo = SuperTokensWrapper.listUsersByAccountInfo;
export let convertToRecipeUserId = SuperTokensWrapper.convertToRecipeUserId;
export let getRequestFromUserContext = SuperTokensWrapper.getRequestFromUserContext;
export let Error = SuperTokensWrapper.Error;
export { default as RecipeUserId } from "./recipeUserId";
export { User } from "./user";
