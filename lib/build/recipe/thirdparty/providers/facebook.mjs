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
import NewProvider from "./custom";
function Facebook(input) {
  var _a;
  if (input.config.name === void 0) {
    input.config.name = "Facebook";
  }
  if (input.config.authorizationEndpoint === void 0) {
    input.config.authorizationEndpoint = "https://www.facebook.com/v12.0/dialog/oauth";
  }
  if (input.config.tokenEndpoint === void 0) {
    input.config.tokenEndpoint = "https://graph.facebook.com/v12.0/oauth/access_token";
  }
  if (input.config.userInfoEndpoint === void 0) {
    input.config.userInfoEndpoint = "https://graph.facebook.com/me";
  }
  input.config.userInfoMap = __spreadProps(__spreadValues({}, input.config.userInfoMap), {
    fromUserInfoAPI: __spreadValues({
      userId: "id"
    }, (_a = input.config.userInfoMap) == null ? void 0 : _a.fromUserInfoAPI)
  });
  const oOverride = input.override;
  input.override = function(originalImplementation) {
    const oGetConfig = originalImplementation.getConfigForClientType;
    originalImplementation.getConfigForClientType = async function(input2) {
      const config = await oGetConfig(input2);
      if (config.scope === void 0) {
        config.scope = ["email"];
      }
      return config;
    };
    const oGetUserInfo = originalImplementation.getUserInfo;
    originalImplementation.getUserInfo = async function(input2) {
      var _a2;
      const fieldsPermissionMap = {
        public_profile: [
          "first_name",
          "last_name",
          "middle_name",
          "name",
          "name_format",
          "picture",
          "short_name"
        ],
        email: ["id", "email"],
        user_birthday: ["birthday"],
        user_videos: ["videos"],
        user_posts: ["posts"],
        user_photos: ["photos"],
        user_location: ["location"],
        user_link: ["link"],
        user_likes: ["likes"],
        user_hometown: ["hometown"],
        user_gender: ["gender"],
        user_friends: ["friends"],
        user_age_range: ["age_range"]
      };
      const scopeValues = originalImplementation.config.scope;
      const fields = (_a2 = scopeValues == null ? void 0 : scopeValues.map((scopeValue) => {
        var _a3;
        return (_a3 = fieldsPermissionMap[scopeValue]) != null ? _a3 : [];
      }).flat().join(",")) != null ? _a2 : "id,email";
      originalImplementation.config.userInfoEndpointQueryParams = __spreadValues({
        access_token: input2.oAuthTokens.access_token,
        fields,
        format: "json"
      }, originalImplementation.config.userInfoEndpointQueryParams);
      originalImplementation.config.userInfoEndpointHeaders = __spreadProps(__spreadValues({}, originalImplementation.config.userInfoEndpointHeaders), {
        Authorization: null
      });
      return await oGetUserInfo(input2);
    };
    if (oOverride !== void 0) {
      originalImplementation = oOverride(originalImplementation);
    }
    return originalImplementation;
  };
  return NewProvider(input);
}
export {
  Facebook as default
};
