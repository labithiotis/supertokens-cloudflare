"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
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
var createTenant_exports = {};
__export(createTenant_exports, {
  default: () => createTenant
});
module.exports = __toCommonJS(createTenant_exports);
var import_multitenancy = __toESM(require("../../../multitenancy"), 1);
var import_error = __toESM(require("../../../../error"), 1);
async function createTenant(_, __, options, userContext) {
  const requestBody = await options.req.getJSONBody();
  const _a = requestBody, { tenantId } = _a, config = __objRest(_a, ["tenantId"]);
  if (typeof tenantId !== "string" || tenantId === "") {
    throw new import_error.default({
      message: "Missing required parameter 'tenantId'",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  let tenantRes;
  try {
    tenantRes = await import_multitenancy.default.createOrUpdateTenant(tenantId, config, userContext);
  } catch (err) {
    const errMsg = err == null ? void 0 : err.message;
    if (errMsg.includes("SuperTokens core threw an error for a ")) {
      if (errMsg.includes("with status code: 402")) {
        return {
          status: "MULTITENANCY_NOT_ENABLED_IN_CORE_ERROR"
        };
      }
      if (errMsg.includes("with status code: 400")) {
        return {
          status: "INVALID_TENANT_ID_ERROR",
          message: errMsg.split(" and message: ")[1]
        };
      }
    }
    throw err;
  }
  if (tenantRes.createdNew === false) {
    return {
      status: "TENANT_ID_ALREADY_EXISTS_ERROR"
    };
  }
  return tenantRes;
}
