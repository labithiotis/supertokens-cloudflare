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
import STError from "../../../../error";
import Session from "../../../session";
const userSessionsGet = async (_, ___, options, userContext) => {
  const userId = options.req.getKeyValueFromQuery("userId");
  if (userId === void 0 || userId === "") {
    throw new STError({
      message: "Missing required parameter 'userId'",
      type: STError.BAD_INPUT_ERROR
    });
  }
  const response = await Session.getAllSessionHandlesForUser(userId, void 0, void 0, userContext);
  let sessions = [];
  let sessionInfoPromises = [];
  for (let i = 0; i < response.length; i++) {
    sessionInfoPromises.push(
      new Promise(async (res, rej) => {
        try {
          const sessionResponse = await Session.getSessionInformation(response[i], userContext);
          if (sessionResponse !== void 0) {
            const accessTokenPayload = sessionResponse.customClaimsInAccessTokenPayload;
            delete sessionResponse.customClaimsInAccessTokenPayload;
            sessions[i] = __spreadProps(__spreadValues({}, sessionResponse), { accessTokenPayload });
          }
          res();
        } catch (e) {
          rej(e);
        }
      })
    );
  }
  await Promise.all(sessionInfoPromises);
  return {
    status: "OK",
    sessions
  };
};
export {
  userSessionsGet
};
