// @ts-nocheck
import type { VerifySessionOptions } from "..";
import { BaseRequest, BaseResponse } from "../../../framework";
import type { NextFunction } from "../../../framework/custom/framework";
import type { SessionContainerInterface } from "../types";
export declare function verifySession<T extends BaseRequest & {
    session?: SessionContainerInterface;
}>(options?: VerifySessionOptions): (req: T, res: BaseResponse, next?: NextFunction | undefined) => Promise<any>;
