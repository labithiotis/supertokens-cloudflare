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

import type { NormalisedAppinfo } from "../../types";
import { postWithFetch } from "../../utils";
import { env } from "node:process";

export async function createAndSendEmailUsingSupertokensService(
    appInfo: NormalisedAppinfo,
    user: {
        id: string;
        email: string;
    },
    passwordResetURLWithToken: string
) {
    // related issue: https://github.com/supertokens/supertokens-node/issues/38
    if (env.TEST_MODE === "testing") {
        return;
    }

    await postWithFetch(
        "https://api.supertokens.io/0/st/auth/password/reset",
        {
            "api-version": "0",
            "content-type": "application/json; charset=utf-8",
        },
        {
            email: user.email,
            appName: appInfo.appName,
            passwordResetURL: passwordResetURLWithToken,
        },
        {
            successLog: `Password reset email sent to ${user.email}`,
            errorLogHeader: "Error sending password reset email",
        }
    );
}
