import Recipe from "./recipe";
import { AllowedDomainsClaim } from "./allowedDomainsClaim";
import { getUserContext } from "../../utils";
class Wrapper {
  static async createOrUpdateTenant(tenantId, config, userContext) {
    const recipeInstance = Recipe.getInstanceOrThrowError();
    return recipeInstance.recipeInterfaceImpl.createOrUpdateTenant({
      tenantId,
      config,
      userContext: getUserContext(userContext)
    });
  }
  static async deleteTenant(tenantId, userContext) {
    const recipeInstance = Recipe.getInstanceOrThrowError();
    return recipeInstance.recipeInterfaceImpl.deleteTenant({
      tenantId,
      userContext: getUserContext(userContext)
    });
  }
  static async getTenant(tenantId, userContext) {
    const recipeInstance = Recipe.getInstanceOrThrowError();
    return recipeInstance.recipeInterfaceImpl.getTenant({
      tenantId,
      userContext: getUserContext(userContext)
    });
  }
  static async listAllTenants(userContext) {
    const recipeInstance = Recipe.getInstanceOrThrowError();
    return recipeInstance.recipeInterfaceImpl.listAllTenants({
      userContext: getUserContext(userContext)
    });
  }
  static async createOrUpdateThirdPartyConfig(tenantId, config, skipValidation, userContext) {
    const recipeInstance = Recipe.getInstanceOrThrowError();
    return recipeInstance.recipeInterfaceImpl.createOrUpdateThirdPartyConfig({
      tenantId,
      config,
      skipValidation,
      userContext: getUserContext(userContext)
    });
  }
  static async deleteThirdPartyConfig(tenantId, thirdPartyId, userContext) {
    const recipeInstance = Recipe.getInstanceOrThrowError();
    return recipeInstance.recipeInterfaceImpl.deleteThirdPartyConfig({
      tenantId,
      thirdPartyId,
      userContext: getUserContext(userContext)
    });
  }
  static async associateUserToTenant(tenantId, recipeUserId, userContext) {
    const recipeInstance = Recipe.getInstanceOrThrowError();
    return recipeInstance.recipeInterfaceImpl.associateUserToTenant({
      tenantId,
      recipeUserId,
      userContext: getUserContext(userContext)
    });
  }
  static async disassociateUserFromTenant(tenantId, recipeUserId, userContext) {
    const recipeInstance = Recipe.getInstanceOrThrowError();
    return recipeInstance.recipeInterfaceImpl.disassociateUserFromTenant({
      tenantId,
      recipeUserId,
      userContext: getUserContext(userContext)
    });
  }
}
Wrapper.init = Recipe.init;
let init = Wrapper.init;
let createOrUpdateTenant = Wrapper.createOrUpdateTenant;
let deleteTenant = Wrapper.deleteTenant;
let getTenant = Wrapper.getTenant;
let listAllTenants = Wrapper.listAllTenants;
let createOrUpdateThirdPartyConfig = Wrapper.createOrUpdateThirdPartyConfig;
let deleteThirdPartyConfig = Wrapper.deleteThirdPartyConfig;
let associateUserToTenant = Wrapper.associateUserToTenant;
let disassociateUserFromTenant = Wrapper.disassociateUserFromTenant;
export {
  AllowedDomainsClaim,
  associateUserToTenant,
  createOrUpdateTenant,
  createOrUpdateThirdPartyConfig,
  Wrapper as default,
  deleteTenant,
  deleteThirdPartyConfig,
  disassociateUserFromTenant,
  getTenant,
  init,
  listAllTenants
};
