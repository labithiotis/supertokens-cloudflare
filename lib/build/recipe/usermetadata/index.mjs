import { getUserContext } from "../../utils";
import Recipe from "./recipe";
class Wrapper {
  static async getUserMetadata(userId, userContext) {
    return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getUserMetadata({
      userId,
      userContext: getUserContext(userContext)
    });
  }
  static async updateUserMetadata(userId, metadataUpdate, userContext) {
    return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.updateUserMetadata({
      userId,
      metadataUpdate,
      userContext: getUserContext(userContext)
    });
  }
  static async clearUserMetadata(userId, userContext) {
    return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.clearUserMetadata({
      userId,
      userContext: getUserContext(userContext)
    });
  }
}
Wrapper.init = Recipe.init;
const init = Wrapper.init;
const getUserMetadata = Wrapper.getUserMetadata;
const updateUserMetadata = Wrapper.updateUserMetadata;
const clearUserMetadata = Wrapper.clearUserMetadata;
export {
  clearUserMetadata,
  Wrapper as default,
  getUserMetadata,
  init,
  updateUserMetadata
};
