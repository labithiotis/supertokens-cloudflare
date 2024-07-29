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
var error_exports = {};
__export(error_exports, {
  default: () => SuperTokensError
});
module.exports = __toCommonJS(error_exports);
const _SuperTokensError = class _SuperTokensError extends Error {
  constructor(options) {
    super(options.message);
    this.type = options.type;
    this.payload = options.payload;
    this.errMagic = _SuperTokensError.errMagic;
  }
  static isErrorFromSuperTokens(obj) {
    return obj.errMagic === _SuperTokensError.errMagic;
  }
};
_SuperTokensError.errMagic = "ndskajfasndlfkj435234krjdsa";
_SuperTokensError.BAD_INPUT_ERROR = "BAD_INPUT_ERROR";
let SuperTokensError = _SuperTokensError;
