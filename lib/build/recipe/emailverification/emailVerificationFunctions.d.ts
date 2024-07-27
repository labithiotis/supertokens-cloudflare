// @ts-nocheck
import type { UserEmailInfo } from "./types";
import type { NormalisedAppinfo } from "../../types";
export declare function createAndSendEmailUsingSupertokensService(appInfo: NormalisedAppinfo, user: UserEmailInfo, emailVerifyURLWithToken: string): Promise<void>;
