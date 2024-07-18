export class SessionClaim {
    constructor(key) {
        this.key = key;
    }
    async build(userId, recipeUserId, tenantId, currentPayload, userContext) {
        const value = await this.fetchValue(userId, recipeUserId, tenantId, currentPayload, userContext);
        if (value === undefined) {
            return {};
        }
        return this.addToPayload_internal({}, value, userContext);
    }
}
