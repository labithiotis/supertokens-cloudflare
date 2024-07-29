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
var generateEmailVerifyToken_exports = {};
__export(generateEmailVerifyToken_exports, {
  default: () => generateEmailVerifyToken
});
module.exports = __toCommonJS(generateEmailVerifyToken_exports);
var import_utils = require("../../../utils");
var import_session = __toESM(require("../../session"), 1);
async function generateEmailVerifyToken(apiImplementation, options, userContext) {
  if (apiImplementation.generateEmailVerifyTokenPOST === void 0) {
    return false;
  }
  const session = await import_session.default.getSession(
    options.req,
    options.res,
    { overrideGlobalClaimValidators: () => [] },
    userContext
  );
  const result = await apiImplementation.generateEmailVerifyTokenPOST({
    options,
    session,
    userContext
  });
  (0, import_utils.send200Response)(options.res, result);
  return true;
}
