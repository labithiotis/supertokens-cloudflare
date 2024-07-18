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
import SuperTokensError from "./error";
import { getRequestFromUserContext } from "../..";
import { getUserContext } from "../../utils";
export default class Wrapper {
    static createCode(input) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.createCode(
            Object.assign(Object.assign({}, input), {
                session: input.session,
                userContext: getUserContext(input.userContext),
            })
        );
    }
    static createNewCodeForDevice(input) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.createNewCodeForDevice(
            Object.assign(Object.assign({}, input), { userContext: getUserContext(input.userContext) })
        );
    }
    static consumeCode(input) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.consumeCode(
            Object.assign(Object.assign({}, input), {
                session: input.session,
                userContext: getUserContext(input.userContext),
            })
        );
    }
    /**
     * This function will only verify the code (not consume it), and:
     * NOT create a new user if it doesn't exist
     * NOT verify the user email if it exists
     * NOT do any linking
     * NOT delete the code unless it returned RESTART_FLOW_ERROR
     */
    static checkCode(input) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.checkCode(
            Object.assign(Object.assign({}, input), { userContext: getUserContext(input.userContext) })
        );
    }
    static updateUser(input) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.updateUser(
            Object.assign(Object.assign({}, input), { userContext: getUserContext(input.userContext) })
        );
    }
    static revokeAllCodes(input) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.revokeAllCodes(
            Object.assign(Object.assign({}, input), { userContext: getUserContext(input.userContext) })
        );
    }
    static revokeCode(input) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.revokeCode(
            Object.assign(Object.assign({}, input), { userContext: getUserContext(input.userContext) })
        );
    }
    static listCodesByEmail(input) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.listCodesByEmail(
            Object.assign(Object.assign({}, input), { userContext: getUserContext(input.userContext) })
        );
    }
    static listCodesByPhoneNumber(input) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.listCodesByPhoneNumber(
            Object.assign(Object.assign({}, input), { userContext: getUserContext(input.userContext) })
        );
    }
    static listCodesByDeviceId(input) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.listCodesByDeviceId(
            Object.assign(Object.assign({}, input), { userContext: getUserContext(input.userContext) })
        );
    }
    static listCodesByPreAuthSessionId(input) {
        return Recipe.getInstanceOrThrowError().recipeInterfaceImpl.listCodesByPreAuthSessionId(
            Object.assign(Object.assign({}, input), { userContext: getUserContext(input.userContext) })
        );
    }
    static createMagicLink(input) {
        const ctx = getUserContext(input.userContext);
        return Recipe.getInstanceOrThrowError().createMagicLink(
            Object.assign(Object.assign({}, input), { request: getRequestFromUserContext(ctx), userContext: ctx })
        );
    }
    static signInUp(input) {
        return Recipe.getInstanceOrThrowError().signInUp(
            Object.assign(Object.assign({}, input), { userContext: getUserContext(input.userContext) })
        );
    }
    static async sendEmail(input) {
        return await Recipe.getInstanceOrThrowError().emailDelivery.ingredientInterfaceImpl.sendEmail(
            Object.assign(Object.assign({}, input), { userContext: getUserContext(input.userContext) })
        );
    }
    static async sendSms(input) {
        return await Recipe.getInstanceOrThrowError().smsDelivery.ingredientInterfaceImpl.sendSms(
            Object.assign(Object.assign({}, input), { userContext: getUserContext(input.userContext) })
        );
    }
}
Wrapper.init = Recipe.init;
Wrapper.Error = SuperTokensError;
export let init = Wrapper.init;
export let Error = Wrapper.Error;
export let createCode = Wrapper.createCode;
export let consumeCode = Wrapper.consumeCode;
export let listCodesByDeviceId = Wrapper.listCodesByDeviceId;
export let listCodesByEmail = Wrapper.listCodesByEmail;
export let listCodesByPhoneNumber = Wrapper.listCodesByPhoneNumber;
export let listCodesByPreAuthSessionId = Wrapper.listCodesByPreAuthSessionId;
export let createNewCodeForDevice = Wrapper.createNewCodeForDevice;
export let updateUser = Wrapper.updateUser;
export let revokeAllCodes = Wrapper.revokeAllCodes;
export let revokeCode = Wrapper.revokeCode;
export let createMagicLink = Wrapper.createMagicLink;
export let signInUp = Wrapper.signInUp;
export let checkCode = Wrapper.checkCode;
export let sendEmail = Wrapper.sendEmail;
export let sendSms = Wrapper.sendSms;
