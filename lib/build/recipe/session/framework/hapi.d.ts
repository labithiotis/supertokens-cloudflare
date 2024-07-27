// @ts-nocheck
import type { VerifySessionOptions } from "..";
import type { ResponseToolkit } from "@hapi/hapi";
import type { SessionRequest } from "../../../framework/hapi/framework";
export declare function verifySession(options?: VerifySessionOptions): (req: SessionRequest, h: ResponseToolkit) => Promise<symbol | import("@hapi/hapi").ResponseObject>;
