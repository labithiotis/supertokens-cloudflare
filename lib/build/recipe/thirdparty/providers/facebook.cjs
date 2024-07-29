"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var facebook_exports = {};
__export(facebook_exports, {
  default: () => Facebook
});
module.exports = __toCommonJS(facebook_exports);
var import_custom = __toESM(require("./custom"), 1);
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
  return (0, import_custom.default)(input);
}
