// @ts-nocheck
import type { VerifySessionOptions } from "..";
import type { SessionRequest } from "../../../framework/fastify/framework";
import type { FastifyReply, FastifyRequest as OriginalFastifyRequest } from "fastify";
export declare function verifySession<TRequest extends OriginalFastifyRequest = OriginalFastifyRequest>(options?: VerifySessionOptions): (req: SessionRequest<TRequest>, res: FastifyReply) => Promise<void>;
