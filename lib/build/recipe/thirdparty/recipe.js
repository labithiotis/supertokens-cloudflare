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
import RecipeModule from "../../recipeModule";
import { validateAndNormaliseUserInput } from "./utils";
import MultitenancyRecipe from "../multitenancy/recipe";
import STError from "./error";
import { SIGN_IN_UP_API, AUTHORISATION_API, APPLE_REDIRECT_HANDLER } from "./constants";
import NormalisedURLPath from "../../normalisedURLPath";
import signInUpAPI from "./api/signinup";
import authorisationUrlAPI from "./api/authorisationUrl";
import RecipeImplementation from "./recipeImplementation";
import APIImplementation from "./api/implementation";
import { Querier } from "../../querier";
import appleRedirectHandler from "./api/appleRedirect";
import OverrideableBuilder from "supertokens-js-override";
import { PostSuperTokensInitCallbacks } from "../../postSuperTokensInitCallbacks";
import { FactorIds } from "../multifactorauth";
import { env } from "node:process";
export default class Recipe extends RecipeModule {
    constructor(recipeId, appInfo, isInServerlessEnv, config, _recipes, _ingredients) {
        super(recipeId, appInfo);
        this.getAPIsHandled = () => {
            return [
                {
                    method: "post",
                    pathWithoutApiBasePath: new NormalisedURLPath(SIGN_IN_UP_API),
                    id: SIGN_IN_UP_API,
                    disabled: this.apiImpl.signInUpPOST === undefined,
                },
                {
                    method: "get",
                    pathWithoutApiBasePath: new NormalisedURLPath(AUTHORISATION_API),
                    id: AUTHORISATION_API,
                    disabled: this.apiImpl.authorisationUrlGET === undefined,
                },
                {
                    method: "post",
                    pathWithoutApiBasePath: new NormalisedURLPath(APPLE_REDIRECT_HANDLER),
                    id: APPLE_REDIRECT_HANDLER,
                    disabled: this.apiImpl.appleRedirectHandlerPOST === undefined,
                },
            ];
        };
        this.handleAPIRequest = async (id, tenantId, req, res, _path, _method, userContext) => {
            let options = {
                config: this.config,
                recipeId: this.getRecipeId(),
                isInServerlessEnv: this.isInServerlessEnv,
                recipeImplementation: this.recipeInterfaceImpl,
                providers: this.providers,
                req,
                res,
                appInfo: this.getAppInfo(),
            };
            if (id === SIGN_IN_UP_API) {
                return await signInUpAPI(this.apiImpl, tenantId, options, userContext);
            } else if (id === AUTHORISATION_API) {
                return await authorisationUrlAPI(this.apiImpl, tenantId, options, userContext);
            } else if (id === APPLE_REDIRECT_HANDLER) {
                return await appleRedirectHandler(this.apiImpl, options, userContext);
            }
            return false;
        };
        this.handleError = async (err, _request, _response) => {
            throw err;
        };
        this.getAllCORSHeaders = () => {
            return [];
        };
        this.isErrorFromThisRecipe = (err) => {
            return STError.isErrorFromSuperTokens(err) && err.fromRecipe === Recipe.RECIPE_ID;
        };
        this.config = validateAndNormaliseUserInput(appInfo, config);
        this.isInServerlessEnv = isInServerlessEnv;
        this.providers = this.config.signInAndUpFeature.providers;
        {
            let builder = new OverrideableBuilder(
                RecipeImplementation(Querier.getNewInstanceOrThrowError(recipeId), this.providers)
            );
            this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
        }
        {
            let builder = new OverrideableBuilder(APIImplementation());
            this.apiImpl = builder.override(this.config.override.apis).build();
        }
        PostSuperTokensInitCallbacks.addPostInitCallback(() => {
            const mtRecipe = MultitenancyRecipe.getInstance();
            if (mtRecipe !== undefined) {
                mtRecipe.staticThirdPartyProviders = this.config.signInAndUpFeature.providers;
                mtRecipe.allAvailableFirstFactors.push(FactorIds.THIRDPARTY);
            }
        });
    }
    static init(config) {
        return (appInfo, isInServerlessEnv) => {
            if (Recipe.instance === undefined) {
                Recipe.instance = new Recipe(
                    Recipe.RECIPE_ID,
                    appInfo,
                    isInServerlessEnv,
                    config,
                    {},
                    {
                        emailDelivery: undefined,
                    }
                );
                return Recipe.instance;
            } else {
                throw new Error("ThirdParty recipe has already been initialised. Please check your code for bugs.");
            }
        };
    }
    static getInstanceOrThrowError() {
        if (Recipe.instance !== undefined) {
            return Recipe.instance;
        }
        throw new Error("Initialisation not done. Did you forget to call the ThirdParty.init function?");
    }
    static reset() {
        if (env.TEST_MODE !== "testing") {
            throw new Error("calling testing function in non testing env");
        }
        Recipe.instance = undefined;
    }
}
Recipe.instance = undefined;
Recipe.RECIPE_ID = "thirdparty";
