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
var userroles_exports = {};
__export(userroles_exports, {
  PermissionClaim: () => import_permissionClaim2.PermissionClaim,
  UserRoleClaim: () => import_userRoleClaim2.UserRoleClaim,
  addRoleToUser: () => addRoleToUser,
  createNewRoleOrAddPermissions: () => createNewRoleOrAddPermissions,
  default: () => Wrapper,
  deleteRole: () => deleteRole,
  getAllRoles: () => getAllRoles,
  getPermissionsForRole: () => getPermissionsForRole,
  getRolesForUser: () => getRolesForUser,
  getRolesThatHavePermission: () => getRolesThatHavePermission,
  getUsersThatHaveRole: () => getUsersThatHaveRole,
  init: () => init,
  removePermissionsFromRole: () => removePermissionsFromRole,
  removeUserRole: () => removeUserRole
});
module.exports = __toCommonJS(userroles_exports);
var import_utils = require("../../utils");
var import_permissionClaim = require("./permissionClaim");
var import_recipe = __toESM(require("./recipe"), 1);
var import_userRoleClaim = require("./userRoleClaim");
var import_userRoleClaim2 = require("./userRoleClaim");
var import_permissionClaim2 = require("./permissionClaim");
class Wrapper {
  static async addRoleToUser(tenantId, userId, role, userContext) {
    return await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.addRoleToUser({
      userId,
      role,
      tenantId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async removeUserRole(tenantId, userId, role, userContext) {
    return await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.removeUserRole({
      userId,
      role,
      tenantId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async getRolesForUser(tenantId, userId, userContext) {
    return await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.getRolesForUser({
      userId,
      tenantId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async getUsersThatHaveRole(tenantId, role, userContext) {
    return await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.getUsersThatHaveRole({
      role,
      tenantId,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async createNewRoleOrAddPermissions(role, permissions, userContext) {
    return await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.createNewRoleOrAddPermissions({
      role,
      permissions,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async getPermissionsForRole(role, userContext) {
    return await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.getPermissionsForRole({
      role,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async removePermissionsFromRole(role, permissions, userContext) {
    return await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.removePermissionsFromRole({
      role,
      permissions,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async getRolesThatHavePermission(permission, userContext) {
    return await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.getRolesThatHavePermission({
      permission,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async deleteRole(role, userContext) {
    return await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.deleteRole({
      role,
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
  static async getAllRoles(userContext) {
    return await import_recipe.default.getInstanceOrThrowError().recipeInterfaceImpl.getAllRoles({
      userContext: (0, import_utils.getUserContext)(userContext)
    });
  }
}
Wrapper.init = import_recipe.default.init;
Wrapper.PermissionClaim = import_permissionClaim.PermissionClaim;
Wrapper.UserRoleClaim = import_userRoleClaim.UserRoleClaim;
const init = Wrapper.init;
const addRoleToUser = Wrapper.addRoleToUser;
const removeUserRole = Wrapper.removeUserRole;
const getRolesForUser = Wrapper.getRolesForUser;
const getUsersThatHaveRole = Wrapper.getUsersThatHaveRole;
const createNewRoleOrAddPermissions = Wrapper.createNewRoleOrAddPermissions;
const getPermissionsForRole = Wrapper.getPermissionsForRole;
const removePermissionsFromRole = Wrapper.removePermissionsFromRole;
const getRolesThatHavePermission = Wrapper.getRolesThatHavePermission;
const deleteRole = Wrapper.deleteRole;
const getAllRoles = Wrapper.getAllRoles;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PermissionClaim,
  UserRoleClaim,
  addRoleToUser,
  createNewRoleOrAddPermissions,
  deleteRole,
  getAllRoles,
  getPermissionsForRole,
  getRolesForUser,
  getRolesThatHavePermission,
  getUsersThatHaveRole,
  init,
  removePermissionsFromRole,
  removeUserRole
});
