import SuperTokens from "../../../supertokens";
async function usersCountGet(_, tenantId, __, userContext) {
  const count = await SuperTokens.getInstanceOrThrowError().getUserCount(void 0, tenantId, userContext);
  return {
    status: "OK",
    count
  };
}
export {
  usersCountGet as default
};
