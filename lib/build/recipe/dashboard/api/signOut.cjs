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
var signOut_exports = {};
__export(signOut_exports, {
  default: () => signOut
});
module.exports = __toCommonJS(signOut_exports);
var import_utils = require("../../../utils");
var import_querier = require("../../../querier");
var import_normalisedURLPath = __toESM(require("../../../normalisedURLPath"), 1);
async function signOut(_, ___, options, userContext) {
  var _a;
  if (options.config.authMode === "api-key") {
    (0, import_utils.send200Response)(options.res, { status: "OK" });
  } else {
    const sessionIdFormAuthHeader = (_a = options.req.getHeaderValue("authorization")) == null ? void 0 : _a.split(" ")[1];
    let querier = import_querier.Querier.getNewInstanceOrThrowError(void 0);
    const sessionDeleteResponse = await querier.sendDeleteRequest(
      new import_normalisedURLPath.default("/recipe/dashboard/session"),
      {},
      { sessionId: sessionIdFormAuthHeader },
      userContext
    );
    (0, import_utils.send200Response)(options.res, sessionDeleteResponse);
  }
  return true;
}
