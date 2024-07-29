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
var claims_exports = {};
__export(claims_exports, {
  BooleanClaim: () => import_booleanClaim.BooleanClaim,
  PrimitiveArrayClaim: () => import_primitiveArrayClaim.PrimitiveArrayClaim,
  PrimitiveClaim: () => import_primitiveClaim.PrimitiveClaim,
  SessionClaim: () => import_types.SessionClaim
});
module.exports = __toCommonJS(claims_exports);
var import_types = require("./types");
var import_primitiveClaim = require("./claimBaseClasses/primitiveClaim");
var import_primitiveArrayClaim = require("./claimBaseClasses/primitiveArrayClaim");
var import_booleanClaim = require("./claimBaseClasses/booleanClaim");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BooleanClaim,
  PrimitiveArrayClaim,
  PrimitiveClaim,
  SessionClaim
});
