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
var multitenancy_exports = {};
__export(multitenancy_exports, {
  AllowedDomainsClaim: () => import_allowedDomainsClaim.AllowedDomainsClaim,
  associateUserToTenant: () => associateUserToTenant,
  createOrUpdateTenant: () => createOrUpdateTenant,
  createOrUpdateThirdPartyConfig: () => createOrUpdateThirdPartyConfig,
  default: () => Wrapper,
  deleteTenant: () => deleteTenant,
  deleteThirdPartyConfig: () => deleteThirdPartyConfig,
  disassociateUserFromTenant: () => disassociateUserFromTenant,
  getTenant: () => getTenant,
  init: () => init,
  listAllTenants: () => listAllTenants
});
module.exports = __toCommonJS(multitenancy_exports);
var import_recipe = __toESM(require("./recipe"), 1);
var import_allowedDomainsClaim = require("./allowedDomainsClaim");
var import_utils = require("../../utils");
class Wrapper {
  static async createOrUpdateTenant(tenantId, config, userContext) {
    const recipeInstance = import_recipe.default.getInstanceOrThrowError();
    return recipeInstance.recipeInterfaceImpl.createOrUpdateTenant({
      tenantId,
      config,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async deleteTenant(tenantId, userContext) {
    const recipeInstance = import_recipe.default.getInstanceOrThrowError();
    return recipeInstance.recipeInterfaceImpl.deleteTenant({
      tenantId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async getTenant(tenantId, userContext) {
    const recipeInstance = import_recipe.default.getInstanceOrThrowError();
    return recipeInstance.recipeInterfaceImpl.getTenant({
      tenantId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async listAllTenants(userContext) {
    const recipeInstance = import_recipe.default.getInstanceOrThrowError();
    return recipeInstance.recipeInterfaceImpl.listAllTenants({
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async createOrUpdateThirdPartyConfig(tenantId, config, skipValidation, userContext) {
    const recipeInstance = import_recipe.default.getInstanceOrThrowError();
    return recipeInstance.recipeInterfaceImpl.createOrUpdateThirdPartyConfig({
      tenantId,
      config,
      skipValidation,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async deleteThirdPartyConfig(tenantId, thirdPartyId, userContext) {
    const recipeInstance = import_recipe.default.getInstanceOrThrowError();
    return recipeInstance.recipeInterfaceImpl.deleteThirdPartyConfig({
      tenantId,
      thirdPartyId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async associateUserToTenant(tenantId, recipeUserId, userContext) {
    const recipeInstance = import_recipe.default.getInstanceOrThrowError();
    return recipeInstance.recipeInterfaceImpl.associateUserToTenant({
      tenantId,
      recipeUserId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async disassociateUserFromTenant(tenantId, recipeUserId, userContext) {
    const recipeInstance = import_recipe.default.getInstanceOrThrowError();
    return recipeInstance.recipeInterfaceImpl.disassociateUserFromTenant({
      tenantId,
      recipeUserId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
}
Wrapper.init = import_recipe.default.init;
let init = Wrapper.init;
let createOrUpdateTenant = Wrapper.createOrUpdateTenant;
let deleteTenant = Wrapper.deleteTenant;
let getTenant = Wrapper.getTenant;
let listAllTenants = Wrapper.listAllTenants;
let createOrUpdateThirdPartyConfig = Wrapper.createOrUpdateThirdPartyConfig;
let deleteThirdPartyConfig = Wrapper.deleteThirdPartyConfig;
let associateUserToTenant = Wrapper.associateUserToTenant;
let disassociateUserFromTenant = Wrapper.disassociateUserFromTenant;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AllowedDomainsClaim,
  associateUserToTenant,
  createOrUpdateTenant,
  createOrUpdateThirdPartyConfig,
  deleteTenant,
  deleteThirdPartyConfig,
  disassociateUserFromTenant,
  getTenant,
  init,
  listAllTenants
});
