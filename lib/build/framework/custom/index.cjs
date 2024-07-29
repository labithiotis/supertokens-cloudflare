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
var custom_exports = {};
__export(custom_exports, {
  CollectingResponse: () => import_framework2.CollectingResponse,
  PreParsedRequest: () => import_framework2.PreParsedRequest,
  errorHandler: () => errorHandler,
  middleware: () => middleware
});
module.exports = __toCommonJS(custom_exports);
var import_framework = require("./framework");
var import_framework2 = require("./framework");
const middleware = import_framework.CustomFrameworkWrapper.middleware;
const errorHandler = import_framework.CustomFrameworkWrapper.errorHandler;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CollectingResponse,
  PreParsedRequest,
  errorHandler,
  middleware
});
