import NormalisedURLPath from "../../normalisedURLPath";
import { DEFAULT_TENANT_ID } from "../multitenancy/constants";
function getRecipeInterface(querier) {
  return {
    addRoleToUser: function({ userId, role, tenantId, userContext }) {
      return querier.sendPutRequest(
        new NormalisedURLPath(`/${tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId}/recipe/user/role`),
        { userId, role },
        userContext
      );
    },
    removeUserRole: function({ userId, role, tenantId, userContext }) {
      return querier.sendPostRequest(
        new NormalisedURLPath(
          `/${tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId}/recipe/user/role/remove`
        ),
        { userId, role },
        userContext
      );
    },
    getRolesForUser: function({ userId, tenantId, userContext }) {
      return querier.sendGetRequest(
        new NormalisedURLPath(`/${tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId}/recipe/user/roles`),
        { userId },
        userContext
      );
    },
    getUsersThatHaveRole: function({ role, tenantId, userContext }) {
      return querier.sendGetRequest(
        new NormalisedURLPath(`/${tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId}/recipe/role/users`),
        { role },
        userContext
      );
    },
    createNewRoleOrAddPermissions: function({ role, permissions, userContext }) {
      return querier.sendPutRequest(new NormalisedURLPath("/recipe/role"), { role, permissions }, userContext);
    },
    getPermissionsForRole: function({ role, userContext }) {
      return querier.sendGetRequest(new NormalisedURLPath("/recipe/role/permissions"), { role }, userContext);
    },
    removePermissionsFromRole: function({ role, permissions, userContext }) {
      return querier.sendPostRequest(
        new NormalisedURLPath("/recipe/role/permissions/remove"),
        {
          role,
          permissions
        },
        userContext
      );
    },
    getRolesThatHavePermission: function({ permission, userContext }) {
      return querier.sendGetRequest(
        new NormalisedURLPath("/recipe/permission/roles"),
        { permission },
        userContext
      );
    },
    deleteRole: function({ role, userContext }) {
      return querier.sendPostRequest(new NormalisedURLPath("/recipe/role/remove"), { role }, userContext);
    },
    getAllRoles: function({ userContext }) {
      return querier.sendGetRequest(new NormalisedURLPath("/recipe/roles"), {}, userContext);
    }
  };
}
export {
  getRecipeInterface as default
};
