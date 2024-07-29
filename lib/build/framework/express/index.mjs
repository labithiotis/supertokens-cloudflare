import { ExpressWrapper } from "./framework";
const middleware = ExpressWrapper.middleware;
const errorHandler = ExpressWrapper.errorHandler;
const wrapRequest = ExpressWrapper.wrapRequest;
const wrapResponse = ExpressWrapper.wrapResponse;
export {
  errorHandler,
  middleware,
  wrapRequest,
  wrapResponse
};
