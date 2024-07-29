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
var removeUserRole_exports = {};
__export(removeUserRole_exports, {
  default: () => removeUserRole_default
});
module.exports = __toCommonJS(removeUserRole_exports);
var import_recipe = __toESM(require("../../../userroles/recipe"), 1);
var import_userroles = __toESM(require("../../../userroles"), 1);
var import_error = __toESM(require("../../../../error"), 1);
const removeUserRole = async (_, tenantId, options, __) => {
  try {
    import_recipe.default.getInstanceOrThrowError();
  } catch (_2) {
    return {
      status: "FEATURE_NOT_ENABLED_ERROR"
    };
  }
  const userId = options.req.getKeyValueFromQuery("userId");
  const role = options.req.getKeyValueFromQuery("role");
  if (role === void 0 || typeof role !== "string") {
    throw new import_error.default({
      message: "Required parameter 'role' is missing or has an invalid type",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  if (userId === void 0 || typeof userId !== "string") {
    throw new import_error.default({
      message: "Required parameter 'userId' is missing or has an invalid type",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  const response = await import_userroles.default.removeUserRole(tenantId, userId, role);
  return response;
};
var removeUserRole_default = removeUserRole;
