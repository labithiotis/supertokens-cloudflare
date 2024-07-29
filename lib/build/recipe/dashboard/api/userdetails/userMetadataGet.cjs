"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var userMetadataGet_exports = {};
__export(userMetadataGet_exports, {
  userMetaDataGet: () => userMetaDataGet
});
module.exports = __toCommonJS(userMetadataGet_exports);
var import_error = __toESM(require("../../../../error"), 1);
var import_recipe = __toESM(require("../../../usermetadata/recipe"), 1);
var import_usermetadata = __toESM(require("../../../usermetadata"), 1);
const userMetaDataGet = async (_, ___, options, userContext) => {
  const userId = options.req.getKeyValueFromQuery("userId");
  if (userId === void 0 || userId === "") {
    throw new import_error.default({
      message: "Missing required parameter 'userId'",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  try {
    import_recipe.default.getInstanceOrThrowError();
  } catch (e) {
    return {
      status: "FEATURE_NOT_ENABLED_ERROR"
    };
  }
  const metaDataResponse = import_usermetadata.default.getUserMetadata(userId, userContext);
  return {
    status: "OK",
    data: (await metaDataResponse).metadata
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  userMetaDataGet
});
