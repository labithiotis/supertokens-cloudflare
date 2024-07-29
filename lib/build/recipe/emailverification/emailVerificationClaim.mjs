var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
import EmailVerificationRecipe from "./recipe";
import { BooleanClaim } from "../session/claims";
class EmailVerificationClaimClass extends BooleanClaim {
  constructor() {
    super({
      key: "st-ev",
      async fetchValue(_userId, recipeUserId, __tenantId, _currentPayload, userContext) {
        const recipe = EmailVerificationRecipe.getInstanceOrThrowError();
        let emailInfo = await recipe.getEmailForRecipeUserId(void 0, recipeUserId, userContext);
        if (emailInfo.status === "OK") {
          return recipe.recipeInterfaceImpl.isEmailVerified({
            recipeUserId,
            email: emailInfo.email,
            userContext
          });
        } else if (emailInfo.status === "EMAIL_DOES_NOT_EXIST_ERROR") {
          return true;
        } else {
          throw new Error("UNKNOWN_USER_ID");
        }
      }
    });
    this.validators = __spreadProps(__spreadValues({}, this.validators), {
      isVerified: (refetchTimeOnFalseInSeconds = 10, maxAgeInSeconds) => __spreadProps(__spreadValues({}, this.validators.hasValue(true, maxAgeInSeconds)), {
        shouldRefetch: (payload, userContext) => {
          const value = this.getValueFromPayload(payload, userContext);
          if (value === void 0) {
            return true;
          }
          const currentTime = Date.now();
          const lastRefetchTime = this.getLastRefetchTime(payload, userContext);
          if (maxAgeInSeconds !== void 0) {
            if (lastRefetchTime < currentTime - maxAgeInSeconds * 1e3) {
              return true;
            }
          }
          if (value === false) {
            if (lastRefetchTime < currentTime - refetchTimeOnFalseInSeconds * 1e3) {
              return true;
            }
          }
          return false;
        }
      })
    });
  }
}
const EmailVerificationClaim = new EmailVerificationClaimClass();
export {
  EmailVerificationClaim,
  EmailVerificationClaimClass
};
