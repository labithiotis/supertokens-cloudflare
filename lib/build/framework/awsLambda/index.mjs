import { AWSWrapper } from "./framework";
const middleware = AWSWrapper.middleware;
const wrapRequest = AWSWrapper.wrapRequest;
const wrapResponse = AWSWrapper.wrapResponse;
export {
  middleware,
  wrapRequest,
  wrapResponse
};
