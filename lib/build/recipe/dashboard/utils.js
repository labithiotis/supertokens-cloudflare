/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
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
import { normaliseEmail, sendNon200ResponseWithMessage } from "../../utils";
import { DASHBOARD_API } from "./constants";
import AccountLinking from "../accountlinking/recipe";
import EmailPasswordRecipe from "../emailpassword/recipe";
import ThirdPartyRecipe from "../thirdparty/recipe";
import PasswordlessRecipe from "../passwordless/recipe";
import { logDebugMessage } from "../../logger";
export function validateAndNormaliseUserInput(config) {
    let override = Object.assign(
        {
            functions: (originalImplementation) => originalImplementation,
            apis: (originalImplementation) => originalImplementation,
        },
        config === undefined ? {} : config.override
    );
    if (
        (config === null || config === void 0 ? void 0 : config.apiKey) !== undefined &&
        (config === null || config === void 0 ? void 0 : config.admins) !== undefined
    ) {
        logDebugMessage("User Dashboard: Providing 'admins' has no effect when using an apiKey.");
    }
    let admins;
    if ((config === null || config === void 0 ? void 0 : config.admins) !== undefined) {
        admins = config.admins.map((email) => normaliseEmail(email));
    }
    return Object.assign(Object.assign({}, config), {
        override,
        authMode: config !== undefined && config.apiKey ? "api-key" : "email-password",
        admins,
    });
}
export function sendUnauthorisedAccess(res) {
    sendNon200ResponseWithMessage(res, "Unauthorised access", 401);
}
export function isValidRecipeId(recipeId) {
    return recipeId === "emailpassword" || recipeId === "thirdparty" || recipeId === "passwordless";
}
export async function getUserForRecipeId(recipeUserId, recipeId, userContext) {
    let userResponse = await _getUserForRecipeId(recipeUserId, recipeId, userContext);
    let user = undefined;
    if (userResponse.user !== undefined) {
        user = Object.assign(Object.assign({}, userResponse.user), { firstName: "", lastName: "" });
    }
    return {
        user,
        recipe: userResponse.recipe,
    };
}
async function _getUserForRecipeId(recipeUserId, recipeId, userContext) {
    let recipe;
    const user = await AccountLinking.getInstance().recipeInterfaceImpl.getUser({
        userId: recipeUserId.getAsString(),
        userContext,
    });
    if (user === undefined) {
        return {
            user: undefined,
            recipe: undefined,
        };
    }
    const loginMethod = user.loginMethods.find(
        (m) => m.recipeId === recipeId && m.recipeUserId.getAsString() === recipeUserId.getAsString()
    );
    if (loginMethod === undefined) {
        return {
            user: undefined,
            recipe: undefined,
        };
    }
    if (recipeId === EmailPasswordRecipe.RECIPE_ID) {
        try {
            // we detect if this recipe has been init or not..
            EmailPasswordRecipe.getInstanceOrThrowError();
            recipe = "emailpassword";
        } catch (e) {
            // No - op
        }
    } else if (recipeId === ThirdPartyRecipe.RECIPE_ID) {
        try {
            ThirdPartyRecipe.getInstanceOrThrowError();
            recipe = "thirdparty";
        } catch (e) {
            // No - op
        }
    } else if (recipeId === PasswordlessRecipe.RECIPE_ID) {
        try {
            PasswordlessRecipe.getInstanceOrThrowError();
            recipe = "passwordless";
        } catch (e) {
            // No - op
        }
    }
    return {
        user,
        recipe,
    };
}
export async function validateApiKey(input) {
    let apiKeyHeaderValue = input.req.getHeaderValue("authorization");
    // We receieve the api key as `Bearer API_KEY`, this retrieves just the key
    apiKeyHeaderValue =
        apiKeyHeaderValue === null || apiKeyHeaderValue === void 0 ? void 0 : apiKeyHeaderValue.split(" ")[1];
    if (apiKeyHeaderValue === undefined) {
        return false;
    }
    return apiKeyHeaderValue === input.config.apiKey;
}
export function getApiPathWithDashboardBase(path) {
    return DASHBOARD_API + path;
}
