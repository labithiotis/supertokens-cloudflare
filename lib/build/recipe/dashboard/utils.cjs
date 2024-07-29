"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
var utils_exports = {};
__export(utils_exports, {
  getApiPathWithDashboardBase: () => getApiPathWithDashboardBase,
  getUserForRecipeId: () => getUserForRecipeId,
  isValidRecipeId: () => isValidRecipeId,
  sendUnauthorisedAccess: () => sendUnauthorisedAccess,
  validateAndNormaliseUserInput: () => validateAndNormaliseUserInput,
  validateApiKey: () => validateApiKey
});
module.exports = __toCommonJS(utils_exports);
var import_utils = require("../../utils");
var import_constants = require("./constants");
var import_recipe = __toESM(require("../accountlinking/recipe"), 1);
var import_recipe2 = __toESM(require("../emailpassword/recipe"), 1);
var import_recipe3 = __toESM(require("../thirdparty/recipe"), 1);
var import_recipe4 = __toESM(require("../passwordless/recipe"), 1);
var import_logger = require("../../logger");
function validateAndNormaliseUserInput(config) {
  let override = __spreadValues({
    functions: (originalImplementation) => originalImplementation,
    apis: (originalImplementation) => originalImplementation
  }, config === void 0 ? {} : config.override);
  if ((config == null ? void 0 : config.apiKey) !== void 0 && (config == null ? void 0 : config.admins) !== void 0) {
    (0, import_logger.logDebugMessage)("User Dashboard: Providing 'admins' has no effect when using an apiKey.");
  }
  let admins;
  if ((config == null ? void 0 : config.admins) !== void 0) {
    admins = config.admins.map((email) => (0, import_utils.normaliseEmail)(email));
  }
  return __spreadProps(__spreadValues({}, config), {
    override,
    authMode: config !== void 0 && config.apiKey ? "api-key" : "email-password",
    admins
  });
}
function sendUnauthorisedAccess(res) {
  (0, import_utils.sendNon200ResponseWithMessage)(res, "Unauthorised access", 401);
}
function isValidRecipeId(recipeId) {
  return recipeId === "emailpassword" || recipeId === "thirdparty" || recipeId === "passwordless";
}
async function getUserForRecipeId(recipeUserId, recipeId, userContext) {
  let userResponse = await _getUserForRecipeId(recipeUserId, recipeId, userContext);
  let user = void 0;
  if (userResponse.user !== void 0) {
    user = __spreadProps(__spreadValues({}, userResponse.user), {
      firstName: "",
      lastName: ""
    });
  }
  return {
    user,
    recipe: userResponse.recipe
  };
}
async function _getUserForRecipeId(recipeUserId, recipeId, userContext) {
  let recipe;
  const user = await import_recipe.default.getInstance().recipeInterfaceImpl.getUser({
    userId: recipeUserId.getAsString(),
    userContext
  });
  if (user === void 0) {
    return {
      user: void 0,
      recipe: void 0
    };
  }
  const loginMethod = user.loginMethods.find(
    (m) => m.recipeId === recipeId && m.recipeUserId.getAsString() === recipeUserId.getAsString()
  );
  if (loginMethod === void 0) {
    return {
      user: void 0,
      recipe: void 0
    };
  }
  if (recipeId === import_recipe2.default.RECIPE_ID) {
    try {
      import_recipe2.default.getInstanceOrThrowError();
      recipe = "emailpassword";
    } catch (e) {
    }
  } else if (recipeId === import_recipe3.default.RECIPE_ID) {
    try {
      import_recipe3.default.getInstanceOrThrowError();
      recipe = "thirdparty";
    } catch (e) {
    }
  } else if (recipeId === import_recipe4.default.RECIPE_ID) {
    try {
      import_recipe4.default.getInstanceOrThrowError();
      recipe = "passwordless";
    } catch (e) {
    }
  }
  return {
    user,
    recipe
  };
}
async function validateApiKey(input) {
  let apiKeyHeaderValue = input.req.getHeaderValue("authorization");
  apiKeyHeaderValue = apiKeyHeaderValue == null ? void 0 : apiKeyHeaderValue.split(" ")[1];
  if (apiKeyHeaderValue === void 0) {
    return false;
  }
  return apiKeyHeaderValue === input.config.apiKey;
}
function getApiPathWithDashboardBase(path) {
  return import_constants.DASHBOARD_API + path;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getApiPathWithDashboardBase,
  getUserForRecipeId,
  isValidRecipeId,
  sendUnauthorisedAccess,
  validateAndNormaliseUserInput,
  validateApiKey
});
