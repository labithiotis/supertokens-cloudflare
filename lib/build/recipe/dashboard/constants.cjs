"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var constants_exports = {};
__export(constants_exports, {
  CREATE_EMAIL_PASSWORD_USER: () => CREATE_EMAIL_PASSWORD_USER,
  CREATE_PASSWORDLESS_USER: () => CREATE_PASSWORDLESS_USER,
  DASHBOARD_ANALYTICS_API: () => DASHBOARD_ANALYTICS_API,
  DASHBOARD_API: () => DASHBOARD_API,
  LIST_TENANTS_WITH_LOGIN_METHODS: () => LIST_TENANTS_WITH_LOGIN_METHODS,
  SEARCH_TAGS_API: () => SEARCH_TAGS_API,
  SIGN_IN_API: () => SIGN_IN_API,
  SIGN_OUT_API: () => SIGN_OUT_API,
  TENANT_API: () => TENANT_API,
  TENANT_THIRD_PARTY_CONFIG_API: () => TENANT_THIRD_PARTY_CONFIG_API,
  UNLINK_USER: () => UNLINK_USER,
  UPDATE_TENANT_CORE_CONFIG_API: () => UPDATE_TENANT_CORE_CONFIG_API,
  UPDATE_TENANT_FIRST_FACTOR_API: () => UPDATE_TENANT_FIRST_FACTOR_API,
  UPDATE_TENANT_REQUIRED_SECONDARY_FACTOR_API: () => UPDATE_TENANT_REQUIRED_SECONDARY_FACTOR_API,
  USERROLES_LIST_API: () => USERROLES_LIST_API,
  USERROLES_PERMISSIONS_API: () => USERROLES_PERMISSIONS_API,
  USERROLES_REMOVE_PERMISSIONS_API: () => USERROLES_REMOVE_PERMISSIONS_API,
  USERROLES_ROLE_API: () => USERROLES_ROLE_API,
  USERROLES_USER_API: () => USERROLES_USER_API,
  USERS_COUNT_API: () => USERS_COUNT_API,
  USERS_LIST_GET_API: () => USERS_LIST_GET_API,
  USER_API: () => USER_API,
  USER_EMAIL_VERIFY_API: () => USER_EMAIL_VERIFY_API,
  USER_EMAIL_VERIFY_TOKEN_API: () => USER_EMAIL_VERIFY_TOKEN_API,
  USER_METADATA_API: () => USER_METADATA_API,
  USER_PASSWORD_API: () => USER_PASSWORD_API,
  USER_SESSIONS_API: () => USER_SESSIONS_API,
  VALIDATE_KEY_API: () => VALIDATE_KEY_API
});
module.exports = __toCommonJS(constants_exports);
const DASHBOARD_API = "/dashboard";
const SIGN_IN_API = "/api/signin";
const SIGN_OUT_API = "/api/signout";
const VALIDATE_KEY_API = "/api/key/validate";
const USERS_LIST_GET_API = "/api/users";
const USERS_COUNT_API = "/api/users/count";
const USER_API = "/api/user";
const USER_EMAIL_VERIFY_API = "/api/user/email/verify";
const USER_METADATA_API = "/api/user/metadata";
const USER_SESSIONS_API = "/api/user/sessions";
const USER_PASSWORD_API = "/api/user/password";
const USER_EMAIL_VERIFY_TOKEN_API = "/api/user/email/verify/token";
const SEARCH_TAGS_API = "/api/search/tags";
const DASHBOARD_ANALYTICS_API = "/api/analytics";
const USERROLES_LIST_API = "/api/userroles/roles";
const USERROLES_ROLE_API = "/api/userroles/role";
const USERROLES_PERMISSIONS_API = "/api/userroles/role/permissions";
const USERROLES_REMOVE_PERMISSIONS_API = "/api/userroles/role/permissions/remove";
const CREATE_EMAIL_PASSWORD_USER = "/api/user/emailpassword";
const CREATE_PASSWORDLESS_USER = "/api/user/passwordless";
const LIST_TENANTS_WITH_LOGIN_METHODS = "/api/tenants";
const USERROLES_USER_API = "/api/userroles/user/roles";
const TENANT_API = "/api/tenant";
const UPDATE_TENANT_FIRST_FACTOR_API = "/api/tenant/first-factor";
const UPDATE_TENANT_REQUIRED_SECONDARY_FACTOR_API = "/api/tenant/required-secondary-factor";
const UPDATE_TENANT_CORE_CONFIG_API = "/api/tenant/core-config";
const TENANT_THIRD_PARTY_CONFIG_API = "/api/thirdparty/config";
const UNLINK_USER = "/api/user/unlink";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CREATE_EMAIL_PASSWORD_USER,
  CREATE_PASSWORDLESS_USER,
  DASHBOARD_ANALYTICS_API,
  DASHBOARD_API,
  LIST_TENANTS_WITH_LOGIN_METHODS,
  SEARCH_TAGS_API,
  SIGN_IN_API,
  SIGN_OUT_API,
  TENANT_API,
  TENANT_THIRD_PARTY_CONFIG_API,
  UNLINK_USER,
  UPDATE_TENANT_CORE_CONFIG_API,
  UPDATE_TENANT_FIRST_FACTOR_API,
  UPDATE_TENANT_REQUIRED_SECONDARY_FACTOR_API,
  USERROLES_LIST_API,
  USERROLES_PERMISSIONS_API,
  USERROLES_REMOVE_PERMISSIONS_API,
  USERROLES_ROLE_API,
  USERROLES_USER_API,
  USERS_COUNT_API,
  USERS_LIST_GET_API,
  USER_API,
  USER_EMAIL_VERIFY_API,
  USER_EMAIL_VERIFY_TOKEN_API,
  USER_METADATA_API,
  USER_PASSWORD_API,
  USER_SESSIONS_API,
  VALIDATE_KEY_API
});
