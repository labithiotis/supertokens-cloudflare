class SessionClaim {
  constructor(key) {
    this.key = key;
  }
  async build(userId, recipeUserId, tenantId, currentPayload, userContext) {
    const value = await this.fetchValue(userId, recipeUserId, tenantId, currentPayload, userContext);
    if (value === void 0) {
      return {};
    }
    return this.addToPayload_internal({}, value, userContext);
  }
}
export {
  SessionClaim
};
