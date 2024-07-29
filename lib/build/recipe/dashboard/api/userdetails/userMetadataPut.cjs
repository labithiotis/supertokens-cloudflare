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
var userMetadataPut_exports = {};
__export(userMetadataPut_exports, {
  userMetadataPut: () => userMetadataPut
});
module.exports = __toCommonJS(userMetadataPut_exports);
var import_recipe = __toESM(require("../../../usermetadata/recipe"), 1);
var import_usermetadata = __toESM(require("../../../usermetadata"), 1);
var import_error = __toESM(require("../../../../error"), 1);
const userMetadataPut = async (_, ___, options, userContext) => {
  const requestBody = await options.req.getJSONBody();
  const userId = requestBody.userId;
  const data = requestBody.data;
  import_recipe.default.getInstanceOrThrowError();
  if (userId === void 0 || typeof userId !== "string") {
    throw new import_error.default({
      message: "Required parameter 'userId' is missing or has an invalid type",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  if (data === void 0 || typeof data !== "string") {
    throw new import_error.default({
      message: "Required parameter 'data' is missing or has an invalid type",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  try {
    let parsedData = JSON.parse(data);
    if (typeof parsedData !== "object") {
      throw new Error();
    }
    if (Array.isArray(parsedData)) {
      throw new Error();
    }
    if (parsedData === null) {
      throw new Error();
    }
  } catch (e) {
    throw new import_error.default({
      message: "'data' must be a valid JSON body",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  await import_usermetadata.default.clearUserMetadata(userId, userContext);
  await import_usermetadata.default.updateUserMetadata(userId, JSON.parse(data), userContext);
  return {
    status: "OK"
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  userMetadataPut
});
