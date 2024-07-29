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
var recipe_exports = {};
__export(recipe_exports, {
  default: () => Recipe
});
module.exports = __toCommonJS(recipe_exports);
var import_supertokens_js_override = __toESM(require("supertokens-js-override"), 1);
var import_recipeModule = __toESM(require("../../recipeModule"), 1);
var import_recipeImplementation = __toESM(require("./recipeImplementation"), 1);
var import_implementation = __toESM(require("./api/implementation"), 1);
var import_utils = require("./utils");
var import_constants = require("./constants");
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import_dashboard = __toESM(require("./api/dashboard"), 1);
var import_error = __toESM(require("../../error"), 1);
var import_validateKey = __toESM(require("./api/validateKey"), 1);
var import_apiKeyProtector = __toESM(require("./api/apiKeyProtector"), 1);
var import_usersGet = __toESM(require("./api/usersGet"), 1);
var import_usersCountGet = __toESM(require("./api/usersCountGet"), 1);
var import_userGet = require("./api/userdetails/userGet");
var import_userEmailVerifyGet = require("./api/userdetails/userEmailVerifyGet");
var import_userMetadataGet = require("./api/userdetails/userMetadataGet");
var import_userSessionsGet = require("./api/userdetails/userSessionsGet");
var import_userDelete = require("./api/userdetails/userDelete");
var import_userEmailVerifyPut = require("./api/userdetails/userEmailVerifyPut");
var import_userMetadataPut = require("./api/userdetails/userMetadataPut");
var import_userPasswordPut = require("./api/userdetails/userPasswordPut");
var import_userPut = require("./api/userdetails/userPut");
var import_userEmailVerifyTokenPost = require("./api/userdetails/userEmailVerifyTokenPost");
var import_userSessionsPost = require("./api/userdetails/userSessionsPost");
var import_signIn = __toESM(require("./api/signIn"), 1);
var import_signOut = __toESM(require("./api/signOut"), 1);
var import_tagsGet = require("./api/search/tagsGet");
var import_analytics = __toESM(require("./api/analytics"), 1);
var import_userUnlinkGet = require("./api/userdetails/userUnlinkGet");
var import_getAllRoles = __toESM(require("./api/userroles/roles/getAllRoles"), 1);
var import_deleteRole = __toESM(require("./api/userroles/roles/deleteRole"), 1);
var import_removePermissions = __toESM(require("./api/userroles/permissions/removePermissions"), 1);
var import_getPermissionsForRole = __toESM(require("./api/userroles/permissions/getPermissionsForRole"), 1);
var import_addRoleToUser = __toESM(require("./api/userroles/addRoleToUser"), 1);
var import_getRolesForUser = __toESM(require("./api/userroles/getRolesForUser"), 1);
var import_removeUserRole = __toESM(require("./api/userroles/removeUserRole"), 1);
var import_createRoleOrAddPermissions = __toESM(require("./api/userroles/roles/createRoleOrAddPermissions"), 1);
var import_emailpasswordUser = require("./api/user/create/emailpasswordUser");
var import_passwordlessUser = require("./api/user/create/passwordlessUser");
var import_listAllTenantsWithLoginMethods = __toESM(require("./api/multitenancy/listAllTenantsWithLoginMethods"), 1);
var import_getTenantInfo = __toESM(require("./api/multitenancy/getTenantInfo"), 1);
var import_deleteTenant = __toESM(require("./api/multitenancy/deleteTenant"), 1);
var import_createTenant = __toESM(require("./api/multitenancy/createTenant"), 1);
var import_deleteThirdPartyConfig = __toESM(require("./api/multitenancy/deleteThirdPartyConfig"), 1);
var import_createOrUpdateThirdPartyConfig = __toESM(require("./api/multitenancy/createOrUpdateThirdPartyConfig"), 1);
var import_updateTenantFirstFactor = __toESM(require("./api/multitenancy/updateTenantFirstFactor"), 1);
var import_updateTenantSecondaryFactor = __toESM(require("./api/multitenancy/updateTenantSecondaryFactor"), 1);
var import_updateTenantCoreConfig = __toESM(require("./api/multitenancy/updateTenantCoreConfig"), 1);
var import_getThirdPartyConfig = __toESM(require("./api/multitenancy/getThirdPartyConfig"), 1);
var import_node_process = require("node:process");
const _Recipe = class _Recipe extends import_recipeModule.default {
  constructor(recipeId, appInfo, isInServerlessEnv, config) {
    super(recipeId, appInfo);
    // abstract instance functions below...............
    this.getAPIsHandled = () => {
      return [
        {
          id: import_constants.DASHBOARD_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)("/")),
          disabled: false,
          method: "get"
        },
        {
          id: import_constants.DASHBOARD_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)("/roles")),
          disabled: false,
          method: "get"
        },
        {
          id: import_constants.DASHBOARD_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)("/tenants")),
          disabled: false,
          method: "get"
        },
        {
          id: import_constants.SIGN_IN_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.SIGN_IN_API)),
          disabled: false,
          method: "post"
        },
        {
          id: import_constants.VALIDATE_KEY_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.VALIDATE_KEY_API)),
          disabled: false,
          method: "post"
        },
        {
          id: import_constants.SIGN_OUT_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.SIGN_OUT_API)),
          disabled: false,
          method: "post"
        },
        {
          id: import_constants.USERS_LIST_GET_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USERS_LIST_GET_API)),
          disabled: false,
          method: "get"
        },
        {
          id: import_constants.USERS_COUNT_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USERS_COUNT_API)),
          disabled: false,
          method: "get"
        },
        {
          id: import_constants.USER_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USER_API)),
          disabled: false,
          method: "get"
        },
        {
          id: import_constants.USER_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USER_API)),
          disabled: false,
          method: "post"
        },
        {
          id: import_constants.USER_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USER_API)),
          disabled: false,
          method: "put"
        },
        {
          id: import_constants.USER_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USER_API)),
          disabled: false,
          method: "delete"
        },
        {
          id: import_constants.USER_EMAIL_VERIFY_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USER_EMAIL_VERIFY_API)),
          disabled: false,
          method: "get"
        },
        {
          id: import_constants.USER_EMAIL_VERIFY_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USER_EMAIL_VERIFY_API)),
          disabled: false,
          method: "put"
        },
        {
          id: import_constants.USER_METADATA_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USER_METADATA_API)),
          disabled: false,
          method: "get"
        },
        {
          id: import_constants.USER_METADATA_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USER_METADATA_API)),
          disabled: false,
          method: "put"
        },
        {
          id: import_constants.USER_SESSIONS_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USER_SESSIONS_API)),
          disabled: false,
          method: "get"
        },
        {
          id: import_constants.USER_SESSIONS_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USER_SESSIONS_API)),
          disabled: false,
          method: "post"
        },
        {
          id: import_constants.USER_PASSWORD_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USER_PASSWORD_API)),
          disabled: false,
          method: "put"
        },
        {
          id: import_constants.USER_EMAIL_VERIFY_TOKEN_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USER_EMAIL_VERIFY_TOKEN_API)),
          disabled: false,
          method: "post"
        },
        {
          id: import_constants.SEARCH_TAGS_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.SEARCH_TAGS_API)),
          disabled: false,
          method: "get"
        },
        {
          id: import_constants.DASHBOARD_ANALYTICS_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.DASHBOARD_ANALYTICS_API)),
          disabled: false,
          method: "post"
        },
        {
          id: import_constants.UNLINK_USER,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.UNLINK_USER)),
          disabled: false,
          method: "get"
        },
        {
          id: import_constants.USERROLES_LIST_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USERROLES_LIST_API)),
          disabled: false,
          method: "get"
        },
        {
          id: import_constants.USERROLES_ROLE_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USERROLES_ROLE_API)),
          disabled: false,
          method: "put"
        },
        {
          id: import_constants.USERROLES_ROLE_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USERROLES_ROLE_API)),
          disabled: false,
          method: "delete"
        },
        {
          id: import_constants.USERROLES_PERMISSIONS_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USERROLES_PERMISSIONS_API)),
          disabled: false,
          method: "get"
        },
        {
          id: import_constants.USERROLES_PERMISSIONS_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USERROLES_PERMISSIONS_API)),
          disabled: false,
          method: "put"
        },
        {
          id: import_constants.USERROLES_REMOVE_PERMISSIONS_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default(
            (0, import_utils.getApiPathWithDashboardBase)(import_constants.USERROLES_REMOVE_PERMISSIONS_API)
          ),
          disabled: false,
          method: "put"
        },
        {
          id: import_constants.USERROLES_USER_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USERROLES_USER_API)),
          disabled: false,
          method: "put"
        },
        {
          id: import_constants.USERROLES_USER_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USERROLES_USER_API)),
          disabled: false,
          method: "get"
        },
        {
          id: import_constants.USERROLES_USER_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.USERROLES_USER_API)),
          disabled: false,
          method: "delete"
        },
        {
          id: import_constants.CREATE_EMAIL_PASSWORD_USER,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.CREATE_EMAIL_PASSWORD_USER)),
          disabled: false,
          method: "post"
        },
        {
          id: import_constants.CREATE_PASSWORDLESS_USER,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.CREATE_PASSWORDLESS_USER)),
          disabled: false,
          method: "post"
        },
        {
          id: import_constants.LIST_TENANTS_WITH_LOGIN_METHODS,
          pathWithoutApiBasePath: new import_normalisedURLPath.default(
            (0, import_utils.getApiPathWithDashboardBase)(import_constants.LIST_TENANTS_WITH_LOGIN_METHODS)
          ),
          disabled: false,
          method: "get"
        },
        {
          id: import_constants.TENANT_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.TENANT_API)),
          disabled: false,
          method: "get"
        },
        {
          id: import_constants.TENANT_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.TENANT_API)),
          disabled: false,
          method: "delete"
        },
        {
          id: import_constants.TENANT_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default((0, import_utils.getApiPathWithDashboardBase)(import_constants.TENANT_API)),
          disabled: false,
          method: "post"
        },
        {
          id: import_constants.UPDATE_TENANT_FIRST_FACTOR_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default(
            (0, import_utils.getApiPathWithDashboardBase)(import_constants.UPDATE_TENANT_FIRST_FACTOR_API)
          ),
          disabled: false,
          method: "put"
        },
        {
          id: import_constants.UPDATE_TENANT_REQUIRED_SECONDARY_FACTOR_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default(
            (0, import_utils.getApiPathWithDashboardBase)(import_constants.UPDATE_TENANT_REQUIRED_SECONDARY_FACTOR_API)
          ),
          disabled: false,
          method: "put"
        },
        {
          id: import_constants.UPDATE_TENANT_CORE_CONFIG_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default(
            (0, import_utils.getApiPathWithDashboardBase)(import_constants.UPDATE_TENANT_CORE_CONFIG_API)
          ),
          disabled: false,
          method: "put"
        },
        {
          id: import_constants.TENANT_THIRD_PARTY_CONFIG_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default(
            (0, import_utils.getApiPathWithDashboardBase)(import_constants.TENANT_THIRD_PARTY_CONFIG_API)
          ),
          disabled: false,
          method: "get"
        },
        {
          id: import_constants.TENANT_THIRD_PARTY_CONFIG_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default(
            (0, import_utils.getApiPathWithDashboardBase)(import_constants.TENANT_THIRD_PARTY_CONFIG_API)
          ),
          disabled: false,
          method: "put"
        },
        {
          id: import_constants.TENANT_THIRD_PARTY_CONFIG_API,
          pathWithoutApiBasePath: new import_normalisedURLPath.default(
            (0, import_utils.getApiPathWithDashboardBase)(import_constants.TENANT_THIRD_PARTY_CONFIG_API)
          ),
          disabled: false,
          method: "delete"
        }
      ];
    };
    this.handleAPIRequest = async (id, tenantId, req, res, __, ___, userContext) => {
      let options = {
        config: this.config,
        recipeId: this.getRecipeId(),
        recipeImplementation: this.recipeInterfaceImpl,
        req,
        res,
        isInServerlessEnv: this.isInServerlessEnv,
        appInfo: this.getAppInfo()
      };
      if (id === import_constants.DASHBOARD_API) {
        return await (0, import_dashboard.default)(this.apiImpl, options, userContext);
      }
      if (id === import_constants.SIGN_IN_API) {
        return await (0, import_signIn.default)(this.apiImpl, options, userContext);
      }
      if (id === import_constants.VALIDATE_KEY_API) {
        return await (0, import_validateKey.default)(this.apiImpl, options, userContext);
      }
      let apiFunction;
      if (id === import_constants.USERS_LIST_GET_API) {
        apiFunction = import_usersGet.default;
      } else if (id === import_constants.USERS_COUNT_API) {
        apiFunction = import_usersCountGet.default;
      } else if (id === import_constants.USER_API) {
        if (req.getMethod() === "get") {
          apiFunction = import_userGet.userGet;
        }
        if (req.getMethod() === "delete") {
          apiFunction = import_userDelete.userDelete;
        }
        if (req.getMethod() === "put") {
          apiFunction = import_userPut.userPut;
        }
      } else if (id === import_constants.USER_EMAIL_VERIFY_API) {
        if (req.getMethod() === "get") {
          apiFunction = import_userEmailVerifyGet.userEmailVerifyGet;
        }
        if (req.getMethod() === "put") {
          apiFunction = import_userEmailVerifyPut.userEmailVerifyPut;
        }
      } else if (id === import_constants.USER_METADATA_API) {
        if (req.getMethod() === "get") {
          apiFunction = import_userMetadataGet.userMetaDataGet;
        }
        if (req.getMethod() === "put") {
          apiFunction = import_userMetadataPut.userMetadataPut;
        }
      } else if (id === import_constants.USER_SESSIONS_API) {
        if (req.getMethod() === "get") {
          apiFunction = import_userSessionsGet.userSessionsGet;
        }
        if (req.getMethod() === "post") {
          apiFunction = import_userSessionsPost.userSessionsPost;
        }
      } else if (id === import_constants.USER_PASSWORD_API) {
        apiFunction = import_userPasswordPut.userPasswordPut;
      } else if (id === import_constants.USER_EMAIL_VERIFY_TOKEN_API) {
        apiFunction = import_userEmailVerifyTokenPost.userEmailVerifyTokenPost;
      } else if (id === import_constants.SEARCH_TAGS_API) {
        apiFunction = import_tagsGet.getSearchTags;
      } else if (id === import_constants.SIGN_OUT_API) {
        apiFunction = import_signOut.default;
      } else if (id === import_constants.DASHBOARD_ANALYTICS_API && req.getMethod() === "post") {
        apiFunction = import_analytics.default;
      } else if (id === import_constants.UNLINK_USER) {
        apiFunction = import_userUnlinkGet.userUnlink;
      } else if (id === import_constants.USERROLES_LIST_API) {
        apiFunction = import_getAllRoles.default;
      } else if (id === import_constants.USERROLES_ROLE_API) {
        if (req.getMethod() === "put") {
          apiFunction = import_createRoleOrAddPermissions.default;
        }
        if (req.getMethod() === "delete") {
          apiFunction = import_deleteRole.default;
        }
      } else if (id === import_constants.USERROLES_PERMISSIONS_API) {
        if (req.getMethod() === "get") {
          apiFunction = import_getPermissionsForRole.default;
        }
      } else if (id === import_constants.USERROLES_REMOVE_PERMISSIONS_API) {
        apiFunction = import_removePermissions.default;
      } else if (id === import_constants.USERROLES_USER_API) {
        if (req.getMethod() === "put") {
          apiFunction = import_addRoleToUser.default;
        }
        if (req.getMethod() === "get") {
          apiFunction = import_getRolesForUser.default;
        }
        if (req.getMethod() === "delete") {
          apiFunction = import_removeUserRole.default;
        }
      } else if (id === import_constants.CREATE_EMAIL_PASSWORD_USER) {
        if (req.getMethod() === "post") {
          apiFunction = import_emailpasswordUser.createEmailPasswordUser;
        }
      } else if (id === import_constants.CREATE_PASSWORDLESS_USER) {
        if (req.getMethod() === "post") {
          apiFunction = import_passwordlessUser.createPasswordlessUser;
        }
      } else if (id === import_constants.LIST_TENANTS_WITH_LOGIN_METHODS) {
        if (req.getMethod() === "get") {
          apiFunction = import_listAllTenantsWithLoginMethods.default;
        }
      } else if (id === import_constants.TENANT_API) {
        if (req.getMethod() === "post") {
          apiFunction = import_createTenant.default;
        }
        if (req.getMethod() === "get") {
          apiFunction = import_getTenantInfo.default;
        }
        if (req.getMethod() === "delete") {
          apiFunction = import_deleteTenant.default;
        }
      } else if (id === import_constants.UPDATE_TENANT_FIRST_FACTOR_API) {
        apiFunction = import_updateTenantFirstFactor.default;
      } else if (id === import_constants.UPDATE_TENANT_REQUIRED_SECONDARY_FACTOR_API) {
        apiFunction = import_updateTenantSecondaryFactor.default;
      } else if (id === import_constants.UPDATE_TENANT_CORE_CONFIG_API) {
        apiFunction = import_updateTenantCoreConfig.default;
      } else if (id === import_constants.TENANT_THIRD_PARTY_CONFIG_API) {
        if (req.getMethod() === "get") {
          apiFunction = import_getThirdPartyConfig.default;
        }
        if (req.getMethod() === "put") {
          apiFunction = import_createOrUpdateThirdPartyConfig.default;
        }
        if (req.getMethod() === "delete") {
          apiFunction = import_deleteThirdPartyConfig.default;
        }
      }
      if (apiFunction === void 0) {
        return false;
      }
      return await (0, import_apiKeyProtector.default)(this.apiImpl, tenantId, options, apiFunction, userContext);
    };
    this.handleError = async (err, _, __) => {
      throw err;
    };
    this.getAllCORSHeaders = () => {
      return [];
    };
    this.isErrorFromThisRecipe = (err) => {
      return import_error.default.isErrorFromSuperTokens(err) && err.fromRecipe === _Recipe.RECIPE_ID;
    };
    this.config = (0, import_utils.validateAndNormaliseUserInput)(config);
    this.isInServerlessEnv = isInServerlessEnv;
    {
      let builder = new import_supertokens_js_override.default((0, import_recipeImplementation.default)());
      this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
    }
    {
      let builder = new import_supertokens_js_override.default((0, import_implementation.default)());
      this.apiImpl = builder.override(this.config.override.apis).build();
    }
  }
  static getInstanceOrThrowError() {
    if (_Recipe.instance !== void 0) {
      return _Recipe.instance;
    }
    throw new Error("Initialisation not done. Did you forget to call the Dashboard.init function?");
  }
  static init(config) {
    return (appInfo, isInServerlessEnv) => {
      if (_Recipe.instance === void 0) {
        _Recipe.instance = new _Recipe(_Recipe.RECIPE_ID, appInfo, isInServerlessEnv, config);
        return _Recipe.instance;
      } else {
        throw new Error("Dashboard recipe has already been initialised. Please check your code for bugs.");
      }
    };
  }
  static reset() {
    if (import_node_process.env.TEST_MODE !== "testing") {
      throw new Error("calling testing function in non testing env");
    }
    _Recipe.instance = void 0;
  }
};
_Recipe.instance = void 0;
_Recipe.RECIPE_ID = "dashboard";
let Recipe = _Recipe;
