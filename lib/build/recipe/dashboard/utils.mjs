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
import { normaliseEmail, sendNon200ResponseWithMessage } from "../../utils";
import { DASHBOARD_API } from "./constants";
import AccountLinking from "../accountlinking/recipe";
import EmailPasswordRecipe from "../emailpassword/recipe";
import ThirdPartyRecipe from "../thirdparty/recipe";
import PasswordlessRecipe from "../passwordless/recipe";
import { logDebugMessage } from "../../logger";
function validateAndNormaliseUserInput(config) {
  let override = __spreadValues({
    functions: (originalImplementation) => originalImplementation,
    apis: (originalImplementation) => originalImplementation
  }, config === void 0 ? {} : config.override);
  if ((config == null ? void 0 : config.apiKey) !== void 0 && (config == null ? void 0 : config.admins) !== void 0) {
    logDebugMessage("User Dashboard: Providing 'admins' has no effect when using an apiKey.");
  }
  let admins;
  if ((config == null ? void 0 : config.admins) !== void 0) {
    admins = config.admins.map((email) => normaliseEmail(email));
  }
  return __spreadProps(__spreadValues({}, config), {
    override,
    authMode: config !== void 0 && config.apiKey ? "api-key" : "email-password",
    admins
  });
}
function sendUnauthorisedAccess(res) {
  sendNon200ResponseWithMessage(res, "Unauthorised access", 401);
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
  const user = await AccountLinking.getInstance().recipeInterfaceImpl.getUser({
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
  if (recipeId === EmailPasswordRecipe.RECIPE_ID) {
    try {
      EmailPasswordRecipe.getInstanceOrThrowError();
      recipe = "emailpassword";
    } catch (e) {
    }
  } else if (recipeId === ThirdPartyRecipe.RECIPE_ID) {
    try {
      ThirdPartyRecipe.getInstanceOrThrowError();
      recipe = "thirdparty";
    } catch (e) {
    }
  } else if (recipeId === PasswordlessRecipe.RECIPE_ID) {
    try {
      PasswordlessRecipe.getInstanceOrThrowError();
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
  return DASHBOARD_API + path;
}
export {
  getApiPathWithDashboardBase,
  getUserForRecipeId,
  isValidRecipeId,
  sendUnauthorisedAccess,
  validateAndNormaliseUserInput,
  validateApiKey
};
