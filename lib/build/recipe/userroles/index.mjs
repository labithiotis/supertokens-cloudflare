import { getUserContext } from "../../utils";
import { PermissionClaim } from "./permissionClaim";
import Recipe from "./recipe";
import { UserRoleClaim } from "./userRoleClaim";
class Wrapper {
  static async addRoleToUser(tenantId, userId, role, userContext) {
    return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.addRoleToUser({
      userId,
      role,
      tenantId,
      userContext: getUserContext(userContext)
    });
  }
  static async removeUserRole(tenantId, userId, role, userContext) {
    return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.removeUserRole({
      userId,
      role,
      tenantId,
      userContext: getUserContext(userContext)
    });
  }
  static async getRolesForUser(tenantId, userId, userContext) {
    return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getRolesForUser({
      userId,
      tenantId,
      userContext: getUserContext(userContext)
    });
  }
  static async getUsersThatHaveRole(tenantId, role, userContext) {
    return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getUsersThatHaveRole({
      role,
      tenantId,
      userContext: getUserContext(userContext)
    });
  }
  static async createNewRoleOrAddPermissions(role, permissions, userContext) {
    return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.createNewRoleOrAddPermissions({
      role,
      permissions,
      userContext: getUserContext(userContext)
    });
  }
  static async getPermissionsForRole(role, userContext) {
    return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getPermissionsForRole({
      role,
      userContext: getUserContext(userContext)
    });
  }
  static async removePermissionsFromRole(role, permissions, userContext) {
    return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.removePermissionsFromRole({
      role,
      permissions,
      userContext: getUserContext(userContext)
    });
  }
  static async getRolesThatHavePermission(permission, userContext) {
    return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getRolesThatHavePermission({
      permission,
      userContext: getUserContext(userContext)
    });
  }
  static async deleteRole(role, userContext) {
    return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.deleteRole({
      role,
      userContext: getUserContext(userContext)
    });
  }
  static async getAllRoles(userContext) {
    return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getAllRoles({
      userContext: getUserContext(userContext)
    });
  }
}
Wrapper.init = Recipe.init;
Wrapper.PermissionClaim = PermissionClaim;
Wrapper.UserRoleClaim = UserRoleClaim;
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
import { UserRoleClaim as UserRoleClaim2 } from "./userRoleClaim";
import { PermissionClaim as PermissionClaim2 } from "./permissionClaim";
export {
  PermissionClaim2 as PermissionClaim,
  UserRoleClaim2 as UserRoleClaim,
  addRoleToUser,
  createNewRoleOrAddPermissions,
  Wrapper as default,
  deleteRole,
  getAllRoles,
  getPermissionsForRole,
  getRolesForUser,
  getRolesThatHavePermission,
  getUsersThatHaveRole,
  init,
  removePermissionsFromRole,
  removeUserRole
};
