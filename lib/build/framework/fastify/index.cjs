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
var fastify_exports = {};
__export(fastify_exports, {
  errorHandler: () => errorHandler,
  plugin: () => plugin,
  wrapRequest: () => wrapRequest,
  wrapResponse: () => wrapResponse
});
module.exports = __toCommonJS(fastify_exports);
var import_framework = require("./framework");
const plugin = import_framework.FastifyWrapper.plugin;
const errorHandler = import_framework.FastifyWrapper.errorHandler;
const wrapRequest = import_framework.FastifyWrapper.wrapRequest;
const wrapResponse = import_framework.FastifyWrapper.wrapResponse;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  errorHandler,
  plugin,
  wrapRequest,
  wrapResponse
});
