import RecipeUserId from "./recipeUserId";
import parsePhoneNumber from "libphonenumber-js/max";
class LoginMethod {
  constructor(loginMethod) {
    this.recipeId = loginMethod.recipeId;
    this.recipeUserId = new RecipeUserId(loginMethod.recipeUserId);
    this.tenantIds = loginMethod.tenantIds;
    this.email = loginMethod.email;
    this.phoneNumber = loginMethod.phoneNumber;
    this.thirdParty = loginMethod.thirdParty;
    this.timeJoined = loginMethod.timeJoined;
    this.verified = loginMethod.verified;
  }
  hasSameEmailAs(email) {
    if (email === void 0) {
      return false;
    }
    email = email.toLowerCase().trim();
    return this.email !== void 0 && this.email === email;
  }
  hasSamePhoneNumberAs(phoneNumber) {
    if (phoneNumber === void 0) {
      return false;
    }
    const parsedPhoneNumber = parsePhoneNumber(phoneNumber.trim(), { extract: false });
    if (parsedPhoneNumber === void 0) {
      phoneNumber = phoneNumber.trim();
    } else {
      phoneNumber = parsedPhoneNumber.format("E.164");
    }
    return this.phoneNumber !== void 0 && this.phoneNumber === phoneNumber;
  }
  hasSameThirdPartyInfoAs(thirdParty) {
    if (thirdParty === void 0) {
      return false;
    }
    thirdParty.id = thirdParty.id.trim();
    thirdParty.userId = thirdParty.userId.trim();
    return this.thirdParty !== void 0 && this.thirdParty.id === thirdParty.id && this.thirdParty.userId === thirdParty.userId;
  }
  toJson() {
    return {
      recipeId: this.recipeId,
      recipeUserId: this.recipeUserId.getAsString(),
      tenantIds: this.tenantIds,
      email: this.email,
      phoneNumber: this.phoneNumber,
      thirdParty: this.thirdParty,
      timeJoined: this.timeJoined,
      verified: this.verified
    };
  }
}
class User {
  // minimum timeJoined value from linkedRecipes
  constructor(user) {
    this.id = user.id;
    this.isPrimaryUser = user.isPrimaryUser;
    this.tenantIds = user.tenantIds;
    this.emails = user.emails;
    this.phoneNumbers = user.phoneNumbers;
    this.thirdParty = user.thirdParty;
    this.timeJoined = user.timeJoined;
    this.loginMethods = user.loginMethods.map((m) => new LoginMethod(m));
  }
  toJson() {
    return {
      id: this.id,
      isPrimaryUser: this.isPrimaryUser,
      tenantIds: this.tenantIds,
      emails: this.emails,
      phoneNumbers: this.phoneNumbers,
      thirdParty: this.thirdParty,
      loginMethods: this.loginMethods.map((m) => m.toJson()),
      timeJoined: this.timeJoined
    };
  }
}
export {
  LoginMethod,
  User
};
