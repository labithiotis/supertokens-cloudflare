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
var signIn_exports = {};
__export(signIn_exports, {
  default: () => signIn
});
module.exports = __toCommonJS(signIn_exports);
var import_utils = require("../../../utils");
var import_error = __toESM(require("../../../error"), 1);
var import_querier = require("../../../querier");
var import_normalisedURLPath = __toESM(require("../../../normalisedURLPath"), 1);
async function signIn(_, options, userContext) {
  const { email, password } = await options.req.getJSONBody();
  if (email === void 0) {
    throw new import_error.default({
      message: "Missing required parameter 'email'",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  if (password === void 0) {
    throw new import_error.default({
      message: "Missing required parameter 'password'",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  let querier = import_querier.Querier.getNewInstanceOrThrowError(void 0);
  const signInResponse = await querier.sendPostRequest(
    new import_normalisedURLPath.default("/recipe/dashboard/signin"),
    {
      email,
      password
    },
    userContext
  );
  (0, import_utils.send200Response)(options.res, signInResponse);
  return true;
}
