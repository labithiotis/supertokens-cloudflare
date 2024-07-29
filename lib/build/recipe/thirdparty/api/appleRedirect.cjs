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
var appleRedirect_exports = {};
__export(appleRedirect_exports, {
  default: () => appleRedirectHandler
});
module.exports = __toCommonJS(appleRedirect_exports);
async function appleRedirectHandler(apiImplementation, options, userContext) {
  if (apiImplementation.appleRedirectHandlerPOST === void 0) {
    return false;
  }
  let body = await options.req.getFormData();
  await apiImplementation.appleRedirectHandlerPOST({
    formPostInfoFromProvider: body,
    options,
    userContext
  });
  return true;
}
