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
export {
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
};
