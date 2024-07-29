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
import UserMetaDataRecipe from "../../../usermetadata/recipe";
import UserMetaData from "../../../usermetadata";
import { getUser } from "../../../..";
const userGet = async (_, ___, options, userContext) => {
  const userId = options.req.getKeyValueFromQuery("userId");
  if (userId === void 0 || userId === "") {
    throw new STError({
      message: "Missing required parameter 'userId'",
      type: STError.BAD_INPUT_ERROR
    });
  }
  let user = await getUser(userId, userContext);
  if (user === void 0) {
    return {
      status: "NO_USER_FOUND_ERROR"
    };
  }
  try {
    UserMetaDataRecipe.getInstanceOrThrowError();
  } catch (_2) {
    return {
      status: "OK",
      user: __spreadProps(__spreadValues({}, user.toJson()), {
        firstName: "FEATURE_NOT_ENABLED",
        lastName: "FEATURE_NOT_ENABLED"
      })
    };
  }
  const userMetaData = await UserMetaData.getUserMetadata(userId, userContext);
  const { first_name, last_name } = userMetaData.metadata;
  return {
    status: "OK",
    user: __spreadProps(__spreadValues({}, user.toJson()), {
      firstName: first_name === void 0 ? "" : first_name,
      lastName: last_name === void 0 ? "" : last_name
    })
  };
};
export {
  userGet
};
