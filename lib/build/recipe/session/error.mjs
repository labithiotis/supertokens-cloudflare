var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
import STError from "../../error";
class SessionError extends STError {
  constructor(options) {
    super(
      options.type === "UNAUTHORISED" && options.payload === void 0 ? __spreadProps(__spreadValues({}, options), {
        payload: {
          clearTokens: true
        }
      }) : __spreadValues({}, options)
    );
    this.fromRecipe = "session";
  }
}
SessionError.UNAUTHORISED = "UNAUTHORISED";
SessionError.TRY_REFRESH_TOKEN = "TRY_REFRESH_TOKEN";
SessionError.TOKEN_THEFT_DETECTED = "TOKEN_THEFT_DETECTED";
SessionError.INVALID_CLAIMS = "INVALID_CLAIMS";
SessionError.CLEAR_DUPLICATE_SESSION_COOKIES = "CLEAR_DUPLICATE_SESSION_COOKIES";
export {
  SessionError as default
};
