import { KoaWrapper } from "./framework";
const middleware = KoaWrapper.middleware;
const wrapRequest = KoaWrapper.wrapRequest;
const wrapResponse = KoaWrapper.wrapResponse;
export {
  middleware,
  wrapRequest,
  wrapResponse
};
