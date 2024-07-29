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
var signout_exports = {};
__export(signout_exports, {
  default: () => signOutAPI
});
module.exports = __toCommonJS(signout_exports);
var import_utils = require("../../../utils");
var import_sessionRequestFunctions = require("../sessionRequestFunctions");
async function signOutAPI(apiImplementation, options, userContext) {
  if (apiImplementation.signOutPOST === void 0) {
    return false;
  }
  const session = await (0, import_sessionRequestFunctions.getSessionFromRequest)({
    req: options.req,
    res: options.res,
    config: options.config,
    recipeInterfaceImpl: options.recipeImplementation,
    options: {
      sessionRequired: true,
      overrideGlobalClaimValidators: () => []
    },
    userContext
  });
  if (session === void 0) {
    throw new Error("should never come here");
  }
  let result = await apiImplementation.signOutPOST({
    options,
    session,
    userContext
  });
  (0, import_utils.send200Response)(options.res, result);
  return true;
}
