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
var implementation_exports = {};
__export(implementation_exports, {
  default: () => getAPIImplementation
});
module.exports = __toCommonJS(implementation_exports);
function getAPIImplementation() {
  return {
    getJWKSGET: async function({
      options,
      userContext
    }) {
      const resp = await options.recipeImplementation.getJWKS({ userContext });
      if (resp.validityInSeconds !== void 0) {
        options.res.setHeader("Cache-Control", `max-age=${resp.validityInSeconds}, must-revalidate`, false);
      }
      return {
        keys: resp.keys
      };
    }
  };
}
