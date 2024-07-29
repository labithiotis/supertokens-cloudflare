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
var refresh_exports = {};
__export(refresh_exports, {
  default: () => handleRefreshAPI
});
module.exports = __toCommonJS(refresh_exports);
var import_utils = require("../../../utils");
async function handleRefreshAPI(apiImplementation, options, userContext) {
  if (apiImplementation.refreshPOST === void 0) {
    return false;
  }
  await apiImplementation.refreshPOST({ options, userContext });
  (0, import_utils.send200Response)(options.res, {});
  return true;
}