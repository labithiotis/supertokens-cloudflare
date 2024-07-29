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
var thirdparty_exports = {};
__export(thirdparty_exports, {
  Error: () => Error2,
  default: () => Wrapper,
  getProvider: () => getProvider,
  init: () => init,
  manuallyCreateOrUpdateUser: () => manuallyCreateOrUpdateUser
});
module.exports = __toCommonJS(thirdparty_exports);
var import_recipe = __toESM(require("./recipe"), 1);
var import_error = __toESM(require("./error"), 1);
var import_constants = require("../multitenancy/constants");
var import_utils = require("../../utils");
class Wrapper {
  static async getProvider(tenantId, thirdPartyId, clientType, userContext) {
    return await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.getProvider({
      thirdPartyId,
      clientType,
      tenantId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async manuallyCreateOrUpdateUser(tenantId, thirdPartyId, thirdPartyUserId, email, isVerified, session, userContext) {
    return await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.manuallyCreateOrUpdateUser({
      thirdPartyId,
      thirdPartyUserId,
      email,
      tenantId: tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId,
      isVerified,
      session,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
}
Wrapper.init = import_recipe.default.init;
Wrapper.Error = import_error.default;
let init = Wrapper.init;
let Error2 = Wrapper.Error;
let getProvider = Wrapper.getProvider;
let manuallyCreateOrUpdateUser = Wrapper.manuallyCreateOrUpdateUser;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Error,
  getProvider,
  init,
  manuallyCreateOrUpdateUser
});
