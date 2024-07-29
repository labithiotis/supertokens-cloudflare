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
var framework_exports = {};
__export(framework_exports, {
  awsLambda: () => awsLambda,
  default: () => framework_default,
  express: () => express,
  fastify: () => fastify,
  hapi: () => hapi,
  koa: () => koa,
  loopback: () => loopback
});
module.exports = __toCommonJS(framework_exports);
var expressFramework = __toESM(require("./express"), 1);
var fastifyFramework = __toESM(require("./fastify"), 1);
var hapiFramework = __toESM(require("./hapi"), 1);
var loopbackFramework = __toESM(require("./loopback"), 1);
var koaFramework = __toESM(require("./koa"), 1);
var awsLambdaFramework = __toESM(require("./awsLambda"), 1);
var framework_default = {
  express: expressFramework,
  fastify: fastifyFramework,
  hapi: hapiFramework,
  loopback: loopbackFramework,
  koa: koaFramework,
  awsLambda: awsLambdaFramework
};
let express = expressFramework;
let fastify = fastifyFramework;
let hapi = hapiFramework;
let loopback = loopbackFramework;
let koa = koaFramework;
let awsLambda = awsLambdaFramework;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  awsLambda,
  express,
  fastify,
  hapi,
  koa,
  loopback
});
