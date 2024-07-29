import UserRoleRecipe from "./recipe";
import { PrimitiveArrayClaim } from "../session/claimBaseClasses/primitiveArrayClaim";
class PermissionClaimClass extends PrimitiveArrayClaim {
  constructor() {
    super({
      key: "st-perm",
      async fetchValue(userId, _recipeUserId, tenantId, _currentPayload, userContext) {
        const recipe = UserRoleRecipe.getInstanceOrThrowError();
        const userRoles = await recipe.recipeInterfaceImpl.getRolesForUser({
          userId,
          tenantId,
          userContext
        });
        const userPermissions = /* @__PURE__ */ new Set();
        for (const role of userRoles.roles) {
          const rolePermissions = await recipe.recipeInterfaceImpl.getPermissionsForRole({
            role,
            userContext
          });
          if (rolePermissions.status === "OK") {
            for (const perm of rolePermissions.permissions) {
              userPermissions.add(perm);
            }
          }
        }
        return Array.from(userPermissions);
      },
      defaultMaxAgeInSeconds: 300
    });
  }
}
const PermissionClaim = new PermissionClaimClass();
export {
  PermissionClaim,
  PermissionClaimClass
};
