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
var recipeImplementation_exports = {};
__export(recipeImplementation_exports, {
  default: () => getRecipeInterface
});
module.exports = __toCommonJS(recipeImplementation_exports);
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import_constants = require("../multitenancy/constants");
function getRecipeInterface(querier) {
  return {
    addRoleToUser: function({ userId, role, tenantId, userContext }) {
      return querier.sendPutRequest(
        new import_normalisedURLPath.default(`/${tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId}/recipe/user/role`),
        { userId, role },
        userContext
      );
    },
    removeUserRole: function({ userId, role, tenantId, userContext }) {
      return querier.sendPostRequest(
        new import_normalisedURLPath.default(
          `/${tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId}/recipe/user/role/remove`
        ),
        { userId, role },
        userContext
      );
    },
    getRolesForUser: function({ userId, tenantId, userContext }) {
      return querier.sendGetRequest(
        new import_normalisedURLPath.default(`/${tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId}/recipe/user/roles`),
        { userId },
        userContext
      );
    },
    getUsersThatHaveRole: function({ role, tenantId, userContext }) {
      return querier.sendGetRequest(
        new import_normalisedURLPath.default(`/${tenantId === void 0 ? import_constants.DEFAULT_TENANT_ID : tenantId}/recipe/role/users`),
        { role },
        userContext
      );
    },
    createNewRoleOrAddPermissions: function({ role, permissions, userContext }) {
      return querier.sendPutRequest(new import_normalisedURLPath.default("/recipe/role"), { role, permissions }, userContext);
    },
    getPermissionsForRole: function({ role, userContext }) {
      return querier.sendGetRequest(new import_normalisedURLPath.default("/recipe/role/permissions"), { role }, userContext);
    },
    removePermissionsFromRole: function({ role, permissions, userContext }) {
      return querier.sendPostRequest(
        new import_normalisedURLPath.default("/recipe/role/permissions/remove"),
        {
          role,
          permissions
        },
        userContext
      );
    },
    getRolesThatHavePermission: function({ permission, userContext }) {
      return querier.sendGetRequest(
        new import_normalisedURLPath.default("/recipe/permission/roles"),
        { permission },
        userContext
      );
    },
    deleteRole: function({ role, userContext }) {
      return querier.sendPostRequest(new import_normalisedURLPath.default("/recipe/role/remove"), { role }, userContext);
    },
    getAllRoles: function({ userContext }) {
      return querier.sendGetRequest(new import_normalisedURLPath.default("/recipe/roles"), {}, userContext);
    }
  };
}
