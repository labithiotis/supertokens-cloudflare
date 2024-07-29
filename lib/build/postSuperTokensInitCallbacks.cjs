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
var postSuperTokensInitCallbacks_exports = {};
__export(postSuperTokensInitCallbacks_exports, {
  PostSuperTokensInitCallbacks: () => PostSuperTokensInitCallbacks
});
module.exports = __toCommonJS(postSuperTokensInitCallbacks_exports);
const _PostSuperTokensInitCallbacks = class _PostSuperTokensInitCallbacks {
  static addPostInitCallback(cb) {
    _PostSuperTokensInitCallbacks.postInitCallbacks.push(cb);
  }
  static runPostInitCallbacks() {
    for (const cb of _PostSuperTokensInitCallbacks.postInitCallbacks) {
      cb();
    }
    _PostSuperTokensInitCallbacks.postInitCallbacks = [];
  }
};
_PostSuperTokensInitCallbacks.postInitCallbacks = [];
let PostSuperTokensInitCallbacks = _PostSuperTokensInitCallbacks;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PostSuperTokensInitCallbacks
});
