import MultitenancyRecipe from "../../../multitenancy/recipe";
import MultifactorAuthRecipe from "../../../multifactorauth/recipe";
import { isFactorConfiguredForTenant } from "../../../multitenancy/utils";
import { FactorIds } from "../../../multifactorauth";
function getNormalisedFirstFactorsBasedOnTenantConfigFromCoreAndSDKInit(tenantDetailsFromCore) {
  let firstFactors;
  let mtInstance = MultitenancyRecipe.getInstanceOrThrowError();
  if (tenantDetailsFromCore.firstFactors !== void 0) {
    firstFactors = tenantDetailsFromCore.firstFactors;
  } else if (mtInstance.staticFirstFactors !== void 0) {
    firstFactors = mtInstance.staticFirstFactors;
  } else {
    firstFactors = Array.from(new Set(mtInstance.allAvailableFirstFactors));
  }
  let validFirstFactors = [];
  for (const factorId of firstFactors) {
    if (isFactorConfiguredForTenant({
      tenantConfig: tenantDetailsFromCore,
      allAvailableFirstFactors: mtInstance.allAvailableFirstFactors,
      firstFactors,
      factorId
    })) {
      validFirstFactors.push(factorId);
    }
  }
  return validFirstFactors;
}
function getNormalisedRequiredSecondaryFactorsBasedOnTenantConfigFromCoreAndSDKInit(tenantDetailsFromCore) {
  const mfaInstance = MultifactorAuthRecipe.getInstance();
  if (mfaInstance === void 0) {
    return [];
  }
  let secondaryFactors = mfaInstance.getAllAvailableSecondaryFactorIds(tenantDetailsFromCore);
  secondaryFactors = secondaryFactors.filter(
    (factorId) => {
      var _a;
      return ((_a = tenantDetailsFromCore.requiredSecondaryFactors) != null ? _a : []).includes(factorId);
    }
  );
  return secondaryFactors;
}
function factorIdToRecipe(factorId) {
  const factorIdToRecipe2 = {
    emailpassword: "Emailpassword",
    thirdparty: "ThirdParty",
    "otp-email": "Passwordless",
    "otp-phone": "Passwordless",
    "link-email": "Passwordless",
    "link-phone": "Passwordless",
    totp: "Totp"
  };
  return factorIdToRecipe2[factorId];
}
function getFactorNotAvailableMessage(factorId, availableFactors) {
  const recipeName = factorIdToRecipe(factorId);
  if (recipeName !== "Passwordless") {
    return `Please initialise ${recipeName} recipe to be able to use this login method`;
  }
  const passwordlessFactors = [FactorIds.LINK_EMAIL, FactorIds.LINK_PHONE, FactorIds.OTP_EMAIL, FactorIds.OTP_PHONE];
  const passwordlessFactorsNotAvailable = passwordlessFactors.filter((f) => !availableFactors.includes(f));
  if (passwordlessFactorsNotAvailable.length === 4) {
    return `Please initialise Passwordless recipe to be able to use this login method`;
  }
  const [flowType, contactMethod] = factorId.split("-");
  return `Please ensure that Passwordless recipe is initialised with contactMethod: ${contactMethod.toUpperCase()} and flowType: ${flowType === "otp" ? "USER_INPUT_CODE" : "MAGIC_LINK"}`;
}
export {
  factorIdToRecipe,
  getFactorNotAvailableMessage,
  getNormalisedFirstFactorsBasedOnTenantConfigFromCoreAndSDKInit,
  getNormalisedRequiredSecondaryFactorsBasedOnTenantConfigFromCoreAndSDKInit
};
