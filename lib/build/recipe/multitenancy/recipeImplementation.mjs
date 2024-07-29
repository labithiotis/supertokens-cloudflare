var __defProp = Object.defineProperty;
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
import NormalisedURLPath from "../../normalisedURLPath";
import { DEFAULT_TENANT_ID } from "./constants";
function getRecipeInterface(querier) {
  return {
    getTenantId: async function({ tenantIdFromFrontend }) {
      return tenantIdFromFrontend;
    },
    createOrUpdateTenant: async function({ tenantId, config, userContext }) {
      let response = await querier.sendPutRequest(
        new NormalisedURLPath(`/recipe/multitenancy/tenant/v2`),
        __spreadValues({
          tenantId
        }, config),
        userContext
      );
      return response;
    },
    deleteTenant: async function({ tenantId, userContext }) {
      let response = await querier.sendPostRequest(
        new NormalisedURLPath(`/recipe/multitenancy/tenant/remove`),
        {
          tenantId
        },
        userContext
      );
      return response;
    },
    getTenant: async function({ tenantId, userContext }) {
      let response = await querier.sendGetRequest(
        new NormalisedURLPath(
          `/${tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId}/recipe/multitenancy/tenant/v2`
        ),
        {},
        userContext
      );
      if (response.status === "TENANT_NOT_FOUND_ERROR") {
        return void 0;
      }
      return response;
    },
    listAllTenants: async function({ userContext }) {
      let response = await querier.sendGetRequest(
        new NormalisedURLPath(`/recipe/multitenancy/tenant/list/v2`),
        {},
        userContext
      );
      return response;
    },
    createOrUpdateThirdPartyConfig: async function({ tenantId, config, skipValidation, userContext }) {
      let response = await querier.sendPutRequest(
        new NormalisedURLPath(
          `/${tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId}/recipe/multitenancy/config/thirdparty`
        ),
        {
          config,
          skipValidation
        },
        userContext
      );
      return response;
    },
    deleteThirdPartyConfig: async function({ tenantId, thirdPartyId, userContext }) {
      let response = await querier.sendPostRequest(
        new NormalisedURLPath(
          `/${tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId}/recipe/multitenancy/config/thirdparty/remove`
        ),
        {
          thirdPartyId
        },
        userContext
      );
      return response;
    },
    associateUserToTenant: async function({ tenantId, recipeUserId, userContext }) {
      let response = await querier.sendPostRequest(
        new NormalisedURLPath(
          `/${tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId}/recipe/multitenancy/tenant/user`
        ),
        {
          recipeUserId: recipeUserId.getAsString()
        },
        userContext
      );
      return response;
    },
    disassociateUserFromTenant: async function({ tenantId, recipeUserId, userContext }) {
      let response = await querier.sendPostRequest(
        new NormalisedURLPath(
          `/${tenantId === void 0 ? DEFAULT_TENANT_ID : tenantId}/recipe/multitenancy/tenant/user/remove`
        ),
        {
          recipeUserId: recipeUserId.getAsString()
        },
        userContext
      );
      return response;
    }
  };
}
export {
  getRecipeInterface as default
};
