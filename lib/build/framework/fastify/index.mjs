import { FastifyWrapper } from "./framework";
const plugin = FastifyWrapper.plugin;
const errorHandler = FastifyWrapper.errorHandler;
const wrapRequest = FastifyWrapper.wrapRequest;
const wrapResponse = FastifyWrapper.wrapResponse;
export {
  errorHandler,
  plugin,
  wrapRequest,
  wrapResponse
};
