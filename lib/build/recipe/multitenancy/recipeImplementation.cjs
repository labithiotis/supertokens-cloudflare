"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var recipeImplementation_exports = {};
__export(recipeImplementation_exports, {
  default: () => getRecipeInterface
});
module.exports = __toCommonJS(recipeImplementation_exports);
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import_constants = require("./constants");
function getRecipeInterface(querier) {
  return {
    getTenantId: async function({ tenantIdFromFrontend }) {
      return tenantIdFromFrontend;
    },
    createOrUpdateTenant: async function({ tenantId, config, userContext }) {
      let response = await querier.sendPutRequest(
        new import_normalisedURLPath.default(`/recipe/multitenancy/tenant/v2`),
        __spreadValues({
          tenantId
        }, config),
        userContext
      );
      return response;
    },
    deleteTenant: async function({ tenantId, userContext }) {
      let response = await querier.sendPostRequest(
        new import_normalisedURLPath.default(`/recipe/multitenancy/tenant/remove`),
        {
          tenantId
        },
        userContext
      );
      return response;
    },
    getTenant: async function({ tenantId, userContext }) {
      let response = await querier.sendGetRequest(
        new import_normalisedURLPath.default(
          `/${tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId}/recipe/multitenancy/tenant/v2`
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
        new import_normalisedURLPath.default(`/recipe/multitenancy/tenant/list/v2`),
        {},
        userContext
      );
      return response;
    },
    createOrUpdateThirdPartyConfig: async function({ tenantId, config, skipValidation, userContext }) {
      let response = await querier.sendPutRequest(
        new import_normalisedURLPath.default(
          `/${tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId}/recipe/multitenancy/config/thirdparty`
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
        new import_normalisedURLPath.default(
          `/${tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId}/recipe/multitenancy/config/thirdparty/remove`
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
        new import_normalisedURLPath.default(
          `/${tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId}/recipe/multitenancy/tenant/user`
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
        new import_normalisedURLPath.default(
          `/${tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId}/recipe/multitenancy/tenant/user/remove`
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
