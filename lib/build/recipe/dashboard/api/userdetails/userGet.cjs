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
var userGet_exports = {};
__export(userGet_exports, {
  userGet: () => userGet
});
module.exports = __toCommonJS(userGet_exports);
var import_error = __toESM(require("../../../../error"), 1);
var import_recipe = __toESM(require("../../../usermetadata/recipe"), 1);
var import_usermetadata = __toESM(require("../../../usermetadata"), 1);
var import__ = require("../../../..");
const userGet = async (_, ___, options, userContext) => {
  const userId = options.req.getKeyValueFromQuery("userId");
  if (userId === void 0 || userId === "") {
    throw new import_error.default({
      message: "Missing required parameter 'userId'",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  let user = await (0, import__.getUser)(userId, userContext);
  if (user === void 0) {
    return {
      status: "NO_USER_FOUND_ERROR"
    };
  }
  try {
    import_recipe.default.getInstanceOrThrowError();
  } catch (_2) {
    return {
      status: "OK",
      user: __spreadProps(__spreadValues({}, user.toJson()), {
        firstName: "FEATURE_NOT_ENABLED",
        lastName: "FEATURE_NOT_ENABLED"
      })
    };
  }
  const userMetaData = await import_usermetadata.default.getUserMetadata(userId, userContext);
  const { first_name, last_name } = userMetaData.metadata;
  return {
    status: "OK",
    user: __spreadProps(__spreadValues({}, user.toJson()), {
      firstName: first_name === void 0 ? "" : first_name,
      lastName: last_name === void 0 ? "" : last_name
    })
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  userGet
});
