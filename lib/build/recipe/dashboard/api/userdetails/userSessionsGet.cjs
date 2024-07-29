"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
var userSessionsGet_exports = {};
__export(userSessionsGet_exports, {
  userSessionsGet: () => userSessionsGet
});
module.exports = __toCommonJS(userSessionsGet_exports);
var import_error = __toESM(require("../../../../error"), 1);
var import_session = __toESM(require("../../../session"), 1);
const userSessionsGet = async (_, ___, options, userContext) => {
  const userId = options.req.getKeyValueFromQuery("userId");
  if (userId === void 0 || userId === "") {
    throw new import_error.default({
      message: "Missing required parameter 'userId'",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  const response = await import_session.default.getAllSessionHandlesForUser(userId, void 0, void 0, userContext);
  let sessions = [];
  let sessionInfoPromises = [];
  for (let i = 0; i < response.length; i++) {
    sessionInfoPromises.push(
      new Promise(async (res, rej) => {
        try {
          const sessionResponse = await import_session.default.getSessionInformation(response[i], userContext);
          if (sessionResponse !== void 0) {
            const accessTokenPayload = sessionResponse.customClaimsInAccessTokenPayload;
            delete sessionResponse.customClaimsInAccessTokenPayload;
            sessions[i] = __spreadProps(__spreadValues({}, sessionResponse), { accessTokenPayload });
          }
          res();
        } catch (e) {
          rej(e);
        }
      })
    );
  }
  await Promise.all(sessionInfoPromises);
  return {
    status: "OK",
    sessions
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  userSessionsGet
});
