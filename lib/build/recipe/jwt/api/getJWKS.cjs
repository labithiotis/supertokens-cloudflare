"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var getJWKS_exports = {};
__export(getJWKS_exports, {
  default: () => getJWKS
});
module.exports = __toCommonJS(getJWKS_exports);
var import_utils = require("../../../utils");
async function getJWKS(apiImplementation, options, userContext) {
  if (apiImplementation.getJWKSGET === void 0) {
    return false;
  }
  let result = await apiImplementation.getJWKSGET({
    options,
    userContext
  });
  if ("status" in result && result.status === "GENERAL_ERROR") {
    (0, import_utils.send200Response)(options.res, result);
  } else {
    options.res.setHeader("Access-Control-Allow-Origin", "*", false);
    (0, import_utils.send200Response)(options.res, result);
  }
  return true;
}
