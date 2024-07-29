import UserRoleRecipe from "./recipe";
import { PrimitiveArrayClaim } from "../session/claimBaseClasses/primitiveArrayClaim";
class UserRoleClaimClass extends PrimitiveArrayClaim {
  constructor() {
    super({
      key: "st-role",
      async fetchValue(userId, _recipeUserId, tenantId, _currentPayload, userContext) {
        const recipe = UserRoleRecipe.getInstanceOrThrowError();
        const res = await recipe.recipeInterfaceImpl.getRolesForUser({
          userId,
          tenantId,
          userContext
        });
        return res.roles;
      },
      defaultMaxAgeInSeconds: 300
    });
  }
}
const UserRoleClaim = new UserRoleClaimClass();
export {
  UserRoleClaim,
  UserRoleClaimClass
};
