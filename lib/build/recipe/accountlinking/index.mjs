import Recipe from "./recipe";
import { getUser } from "../..";
import { getUserContext } from "../../utils";
class Wrapper {
  /**
   * This is a function which is a combination of createPrimaryUser and
   * linkAccounts where the input recipeUserId is either linked to a user that it can be
   * linked to, or is made into a primary user.
   *
   * The output will be the user ID of the user that it was linked to, or it will be the
   * same as the input recipeUserId if it was made into a primary user, or if there was
   * no linking that happened.
   */
  static async createPrimaryUserIdOrLinkAccounts(tenantId, recipeUserId, session, userContext) {
    const user = await getUser(recipeUserId.getAsString(), userContext);
    if (user === void 0) {
      throw new Error("Unknown recipeUserId");
    }
    const linkRes = await Recipe.getInstance().tryLinkingByAccountInfoOrCreatePrimaryUser({
      tenantId,
      inputUser: user,
      session,
      userContext: getUserContext(userContext)
    });
    if (linkRes.status === "NO_LINK") {
      return user;
    }
    return linkRes.user;
  }
  /**
   * This function returns the primary user that the input recipe ID can be
   * linked to. It can be used to determine which primary account the linking
   * will happen to if the input recipe user ID was to be linked.
   *
   * If the function returns undefined, it means that there is no primary user
   * that the input recipe ID can be linked to, and therefore it can be made
   * into a primary user itself.
   */
  static async getPrimaryUserThatCanBeLinkedToRecipeUserId(tenantId, recipeUserId, userContext) {
    const user = await getUser(recipeUserId.getAsString(), userContext);
    if (user === void 0) {
      throw new Error("Unknown recipeUserId");
    }
    return await Recipe.getInstance().getPrimaryUserThatCanBeLinkedToRecipeUserId({
      tenantId,
      user,
      userContext: getUserContext(userContext)
    });
  }
  static async canCreatePrimaryUser(recipeUserId, userContext) {
    return await Recipe.getInstance().recipeInterfaceImpl.canCreatePrimaryUser({
      recipeUserId,
      userContext: getUserContext(userContext)
    });
  }
  static async createPrimaryUser(recipeUserId, userContext) {
    return await Recipe.getInstance().recipeInterfaceImpl.createPrimaryUser({
      recipeUserId,
      userContext: getUserContext(userContext)
    });
  }
  static async canLinkAccounts(recipeUserId, primaryUserId, userContext) {
    return await Recipe.getInstance().recipeInterfaceImpl.canLinkAccounts({
      recipeUserId,
      primaryUserId,
      userContext: getUserContext(userContext)
    });
  }
  static async linkAccounts(recipeUserId, primaryUserId, userContext) {
    return await Recipe.getInstance().recipeInterfaceImpl.linkAccounts({
      recipeUserId,
      primaryUserId,
      userContext: getUserContext(userContext)
    });
  }
  static async unlinkAccount(recipeUserId, userContext) {
    return await Recipe.getInstance().recipeInterfaceImpl.unlinkAccount({
      recipeUserId,
      userContext: getUserContext(userContext)
    });
  }
  static async isSignUpAllowed(tenantId, newUser, isVerified, session, userContext) {
    return await Recipe.getInstance().isSignUpAllowed({
      newUser,
      isVerified,
      session,
      tenantId,
      userContext: getUserContext(userContext)
    });
  }
  static async isSignInAllowed(tenantId, recipeUserId, session, userContext) {
    const user = await getUser(recipeUserId.getAsString(), userContext);
    if (user === void 0) {
      throw new Error("Unknown recipeUserId");
    }
    return await Recipe.getInstance().isSignInAllowed({
      user,
      accountInfo: user.loginMethods.find((lm) => lm.recipeUserId.getAsString() === recipeUserId.getAsString()),
      session,
      tenantId,
      signInVerifiesLoginMethod: false,
      userContext: getUserContext(userContext)
    });
  }
  static async isEmailChangeAllowed(recipeUserId, newEmail, isVerified, session, userContext) {
    const user = await getUser(recipeUserId.getAsString(), userContext);
    const res = await Recipe.getInstance().isEmailChangeAllowed({
      user,
      newEmail,
      isVerified,
      session,
      userContext: getUserContext(userContext)
    });
    return res.allowed;
  }
}
Wrapper.init = Recipe.init;
const init = Wrapper.init;
const canCreatePrimaryUser = Wrapper.canCreatePrimaryUser;
const createPrimaryUser = Wrapper.createPrimaryUser;
const canLinkAccounts = Wrapper.canLinkAccounts;
const linkAccounts = Wrapper.linkAccounts;
const unlinkAccount = Wrapper.unlinkAccount;
const createPrimaryUserIdOrLinkAccounts = Wrapper.createPrimaryUserIdOrLinkAccounts;
const getPrimaryUserThatCanBeLinkedToRecipeUserId = Wrapper.getPrimaryUserThatCanBeLinkedToRecipeUserId;
const isSignUpAllowed = Wrapper.isSignUpAllowed;
const isSignInAllowed = Wrapper.isSignInAllowed;
const isEmailChangeAllowed = Wrapper.isEmailChangeAllowed;
export {
  canCreatePrimaryUser,
  canLinkAccounts,
  createPrimaryUser,
  createPrimaryUserIdOrLinkAccounts,
  Wrapper as default,
  getPrimaryUserThatCanBeLinkedToRecipeUserId,
  init,
  isEmailChangeAllowed,
  isSignInAllowed,
  isSignUpAllowed,
  linkAccounts,
  unlinkAccount
};
