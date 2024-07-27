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
import SuperTokensError from "../../error";
import NormalisedURLPath from "../../normalisedURLPath";
import { Querier } from "../../querier";
import RecipeModule from "../../recipeModule";
import getJWKS from "./api/getJWKS";
import APIImplementation from "./api/implementation";
import { GET_JWKS_API } from "./constants";
import RecipeImplementation from "./recipeImplementation";
import { validateAndNormaliseUserInput } from "./utils";
import OverrideableBuilder from "supertokens-js-override";
import { env } from "node:process";
export default class Recipe extends RecipeModule {
    constructor(recipeId, appInfo, isInServerlessEnv, config) {
        super(recipeId, appInfo);
        this.handleAPIRequest = async (_id, _tenantId, req, res, _path, _method, userContext) => {
            let options = {
                config: this.config,
                recipeId: this.getRecipeId(),
                isInServerlessEnv: this.isInServerlessEnv,
                recipeImplementation: this.recipeInterfaceImpl,
                req,
                res,
            };
            return await getJWKS(this.apiImpl, options, userContext);
        };
        this.config = validateAndNormaliseUserInput(this, appInfo, config);
        this.isInServerlessEnv = isInServerlessEnv;
        {
            let builder = new OverrideableBuilder(RecipeImplementation(Querier.getNewInstanceOrThrowError(recipeId), this.config, appInfo));
            this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
        }
        {
            let builder = new OverrideableBuilder(APIImplementation());
            this.apiImpl = builder.override(this.config.override.apis).build();
        }
    }
    /* Init functions */
    static getInstanceOrThrowError() {
        if (Recipe.instance !== undefined) {
            return Recipe.instance;
        }
        throw new Error("Initialisation not done. Did you forget to call the Jwt.init function?");
    }
    static init(config) {
        return (appInfo, isInServerlessEnv) => {
            if (Recipe.instance === undefined) {
                Recipe.instance = new Recipe(Recipe.RECIPE_ID, appInfo, isInServerlessEnv, config);
                return Recipe.instance;
            }
            else {
                throw new Error("JWT recipe has already been initialised. Please check your code for bugs.");
            }
        };
    }
    static reset() {
        if (env.TEST_MODE !== "testing") {
            throw new Error("calling testing function in non testing env");
        }
        Recipe.instance = undefined;
    }
    /* RecipeModule functions */
    getAPIsHandled() {
        return [
            {
                method: "get",
                pathWithoutApiBasePath: new NormalisedURLPath(GET_JWKS_API),
                id: GET_JWKS_API,
                disabled: this.apiImpl.getJWKSGET === undefined,
            },
        ];
    }
    handleError(error, _, __, _userContext) {
        throw error;
    }
    getAllCORSHeaders() {
        return [];
    }
    isErrorFromThisRecipe(err) {
        return SuperTokensError.isErrorFromSuperTokens(err) && err.fromRecipe === Recipe.RECIPE_ID;
    }
}
Recipe.RECIPE_ID = "jwt";
Recipe.instance = undefined;
