import Recipe from "./recipe";
import SuperTokensError from "./error";
import { DEFAULT_TENANT_ID } from "../multitenancy/constants";
import { getUserContext } from "../../utils";
class Wrapper {
  static async getProvider(tenantId, thirdPartyId, clientType, userContext) {
    return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getProvider({
      thirdPartyId,
      clientType,
      tenantId,
      userContext: getUserContext(userContext)
    });
  }
  static async manuallyCreateOrUpdateUser(tenantId, thirdPartyId, thirdPartyUserId, email, isVerified, session, userContext) {
    return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.manuallyCreateOrUpdateUser({
      thirdPartyId,
      thirdPartyUserId,
      email,
      tenantId: tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId,
      isVerified,
      session,
      userContext: getUserContext(userContext)
    });
  }
}
Wrapper.init = Recipe.init;
Wrapper.Error = SuperTokensError;
let init = Wrapper.init;
let Error = Wrapper.Error;
let getProvider = Wrapper.getProvider;
let manuallyCreateOrUpdateUser = Wrapper.manuallyCreateOrUpdateUser;
export {
  Error,
  Wrapper as default,
  getProvider,
  init,
  manuallyCreateOrUpdateUser
};
