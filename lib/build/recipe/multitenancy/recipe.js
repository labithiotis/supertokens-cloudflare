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
import OverrideableBuilder from "supertokens-js-override";
import NormalisedURLPath from "../../normalisedURLPath";
import { PostSuperTokensInitCallbacks } from "../../postSuperTokensInitCallbacks";
import { Querier } from "../../querier";
import RecipeModule from "../../recipeModule";
import STError from "../../error";
import RecipeImplementation from "./recipeImplementation";
import APIImplementation from "./api/implementation";
import SessionRecipe from "../session/recipe";
import { LOGIN_METHODS_API } from "./constants";
import { AllowedDomainsClaim } from "./allowedDomainsClaim";
import { validateAndNormaliseUserInput } from "./utils";
import loginMethodsAPI from "./api/loginMethods";
export default class Recipe extends RecipeModule {
    constructor(recipeId, appInfo, isInServerlessEnv, config) {
        super(recipeId, appInfo);
        this.staticThirdPartyProviders = [];
        this.allAvailableFirstFactors = [];
        this.staticFirstFactors = undefined;
        // abstract instance functions below...............
        this.getAPIsHandled = () => {
            return [
                {
                    method: "get",
                    pathWithoutApiBasePath: new NormalisedURLPath(LOGIN_METHODS_API),
                    id: LOGIN_METHODS_API,
                    disabled: this.apiImpl.loginMethodsGET === undefined,
                },
            ];
        };
        this.handleAPIRequest = async (id, tenantId, req, res, _, __, userContext) => {
            let options = {
                recipeImplementation: this.recipeInterfaceImpl,
                config: this.config,
                recipeId: this.getRecipeId(),
                isInServerlessEnv: this.isInServerlessEnv,
                req,
                res,
                staticThirdPartyProviders: this.staticThirdPartyProviders,
                allAvailableFirstFactors: this.allAvailableFirstFactors,
                staticFirstFactors: this.staticFirstFactors,
            };
            if (id === LOGIN_METHODS_API) {
                return await loginMethodsAPI(this.apiImpl, tenantId, options, userContext);
            }
            throw new Error("should never come here");
        };
        this.handleError = async (err, _, __) => {
            throw err;
        };
        this.getAllCORSHeaders = () => {
            return [];
        };
        this.isErrorFromThisRecipe = (err) => {
            return STError.isErrorFromSuperTokens(err) && err.fromRecipe === Recipe.RECIPE_ID;
        };
        this.config = validateAndNormaliseUserInput(config);
        this.isInServerlessEnv = isInServerlessEnv;
        {
            let builder = new OverrideableBuilder(RecipeImplementation(Querier.getNewInstanceOrThrowError(recipeId)));
            this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
        }
        {
            let builder = new OverrideableBuilder(APIImplementation());
            this.apiImpl = builder.override(this.config.override.apis).build();
        }
        this.getAllowedDomainsForTenantId = this.config.getAllowedDomainsForTenantId;
    }
    static getInstanceOrThrowError() {
        if (Recipe.instance !== undefined) {
            return Recipe.instance;
        }
        throw new Error("Initialisation not done. Did you forget to call the Multitenancy.init function?");
    }
    static getInstance() {
        return Recipe.instance;
    }
    static init(config) {
        return (appInfo, isInServerlessEnv) => {
            if (Recipe.instance === undefined) {
                Recipe.instance = new Recipe(Recipe.RECIPE_ID, appInfo, isInServerlessEnv, config);
                if (Recipe.instance.getAllowedDomainsForTenantId !== undefined) {
                    PostSuperTokensInitCallbacks.addPostInitCallback(() => {
                        try {
                            SessionRecipe.getInstanceOrThrowError().addClaimFromOtherRecipe(AllowedDomainsClaim);
                        } catch (_a) {
                            // Skip adding claims if session recipe is not initialised
                        }
                    });
                }
                return Recipe.instance;
            } else {
                throw new Error("Multitenancy recipe has already been initialised. Please check your code for bugs.");
            }
        };
    }
    static reset() {
        if (process.env.TEST_MODE !== "testing") {
            throw new Error("calling testing function in non testing env");
        }
        Recipe.instance = undefined;
    }
}
Recipe.instance = undefined;
Recipe.RECIPE_ID = "multitenancy";
