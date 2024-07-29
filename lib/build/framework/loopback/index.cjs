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
var loopback_exports = {};
__export(loopback_exports, {
  middleware: () => middleware,
  wrapRequest: () => wrapRequest,
  wrapResponse: () => wrapResponse
});
module.exports = __toCommonJS(loopback_exports);
var import_framework = require("./framework");
const middleware = import_framework.LoopbackWrapper.middleware;
const wrapRequest = import_framework.LoopbackWrapper.wrapRequest;
const wrapResponse = import_framework.LoopbackWrapper.wrapResponse;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  middleware,
  wrapRequest,
  wrapResponse
});
