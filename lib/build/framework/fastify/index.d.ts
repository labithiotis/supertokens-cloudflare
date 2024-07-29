// @ts-nocheck
export type { SessionRequest } from "./framework";
export declare const plugin: import("fastify").FastifyPluginCallback;
export declare const errorHandler: () => (err: any, req: import("fastify").FastifyRequest, res: import("fastify").FastifyReply) => Promise<void>;
export declare const wrapRequest: (unwrapped: any) => import("..").BaseRequest;
export declare const wrapResponse: (unwrapped: any) => import("..").BaseResponse;
