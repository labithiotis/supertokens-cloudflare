import * as expressFramework from "./express";
import * as fastifyFramework from "./fastify";
import * as hapiFramework from "./hapi";
import * as loopbackFramework from "./loopback";
import * as koaFramework from "./koa";
import * as awsLambdaFramework from "./awsLambda";
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
export {
  awsLambda,
  framework_default as default,
  express,
  fastify,
  hapi,
  koa,
  loopback
};
