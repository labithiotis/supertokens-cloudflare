"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var user_exports = {};
__export(user_exports, {
  LoginMethod: () => LoginMethod,
  User: () => User
});
module.exports = __toCommonJS(user_exports);
var import_recipeUserId = __toESM(require("./recipeUserId"), 1);
var import_max = __toESM(require("libphonenumber-js/max"), 1);
class LoginMethod {
  constructor(loginMethod) {
    this.recipeId = loginMethod.recipeId;
    this.recipeUserId = new import_recipeUserId.default(loginMethod.recipeUserId);
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
    const parsedPhoneNumber = (0, import_max.default)(phoneNumber.trim(), { extract: false });
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LoginMethod,
  User
});
