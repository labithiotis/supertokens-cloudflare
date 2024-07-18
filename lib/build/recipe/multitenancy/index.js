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
import Recipe from "./recipe";
import { AllowedDomainsClaim } from "./allowedDomainsClaim";
import { getUserContext } from "../../utils";
export default class Wrapper {
    static async createOrUpdateTenant(tenantId, config, userContext) {
        const recipeInstance = Recipe.getInstanceOrThrowError();
        return recipeInstance.recipeInterfaceImpl.createOrUpdateTenant({
            tenantId,
            config,
            userContext: getUserContext(userContext),
        });
    }
    static async deleteTenant(tenantId, userContext) {
        const recipeInstance = Recipe.getInstanceOrThrowError();
        return recipeInstance.recipeInterfaceImpl.deleteTenant({
            tenantId,
            userContext: getUserContext(userContext),
        });
    }
    static async getTenant(tenantId, userContext) {
        const recipeInstance = Recipe.getInstanceOrThrowError();
        return recipeInstance.recipeInterfaceImpl.getTenant({
            tenantId,
            userContext: getUserContext(userContext),
        });
    }
    static async listAllTenants(userContext) {
        const recipeInstance = Recipe.getInstanceOrThrowError();
        return recipeInstance.recipeInterfaceImpl.listAllTenants({
            userContext: getUserContext(userContext),
        });
    }
    static async createOrUpdateThirdPartyConfig(tenantId, config, skipValidation, userContext) {
        const recipeInstance = Recipe.getInstanceOrThrowError();
        return recipeInstance.recipeInterfaceImpl.createOrUpdateThirdPartyConfig({
            tenantId,
            config,
            skipValidation,
            userContext: getUserContext(userContext),
        });
    }
    static async deleteThirdPartyConfig(tenantId, thirdPartyId, userContext) {
        const recipeInstance = Recipe.getInstanceOrThrowError();
        return recipeInstance.recipeInterfaceImpl.deleteThirdPartyConfig({
            tenantId,
            thirdPartyId,
            userContext: getUserContext(userContext),
        });
    }
    static async associateUserToTenant(tenantId, recipeUserId, userContext) {
        const recipeInstance = Recipe.getInstanceOrThrowError();
        return recipeInstance.recipeInterfaceImpl.associateUserToTenant({
            tenantId,
            recipeUserId,
            userContext: getUserContext(userContext),
        });
    }
    static async disassociateUserFromTenant(tenantId, recipeUserId, userContext) {
        const recipeInstance = Recipe.getInstanceOrThrowError();
        return recipeInstance.recipeInterfaceImpl.disassociateUserFromTenant({
            tenantId,
            recipeUserId,
            userContext: getUserContext(userContext),
        });
    }
}
Wrapper.init = Recipe.init;
export let init = Wrapper.init;
export let createOrUpdateTenant = Wrapper.createOrUpdateTenant;
export let deleteTenant = Wrapper.deleteTenant;
export let getTenant = Wrapper.getTenant;
export let listAllTenants = Wrapper.listAllTenants;
export let createOrUpdateThirdPartyConfig = Wrapper.createOrUpdateThirdPartyConfig;
export let deleteThirdPartyConfig = Wrapper.deleteThirdPartyConfig;
export let associateUserToTenant = Wrapper.associateUserToTenant;
export let disassociateUserFromTenant = Wrapper.disassociateUserFromTenant;
export { AllowedDomainsClaim };
