import { PrimitiveArrayClaim } from "../session/claims";
import Recipe from "./recipe";
class AllowedDomainsClaimClass extends PrimitiveArrayClaim {
  constructor() {
    super({
      key: "st-t-dmns",
      async fetchValue(_userId, _recipeUserId, tenantId, _currentPayload, userContext) {
        const recipe = Recipe.getInstanceOrThrowError();
        if (recipe.getAllowedDomainsForTenantId === void 0) {
          return void 0;
        }
        return await recipe.getAllowedDomainsForTenantId(tenantId, userContext);
      },
      defaultMaxAgeInSeconds: 3600
    });
  }
}
const AllowedDomainsClaim = new AllowedDomainsClaimClass();
export {
  AllowedDomainsClaim,
  AllowedDomainsClaimClass
};
