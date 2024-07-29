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
var updateTenantCoreConfig_exports = {};
__export(updateTenantCoreConfig_exports, {
  default: () => updateTenantCoreConfig
});
module.exports = __toCommonJS(updateTenantCoreConfig_exports);
var import_recipe = __toESM(require("../../../multitenancy/recipe"), 1);
async function updateTenantCoreConfig(_, tenantId, options, userContext) {
  const requestBody = await options.req.getJSONBody();
  const { name, value } = requestBody;
  const mtRecipe = import_recipe.default.getInstance();
  const tenantRes = await mtRecipe.recipeInterfaceImpl.getTenant({ tenantId, userContext });
  if (tenantRes === void 0) {
    return {
      status: "UNKNOWN_TENANT_ERROR"
    };
  }
  try {
    await mtRecipe.recipeInterfaceImpl.createOrUpdateTenant({
      tenantId,
      config: {
        coreConfig: {
          [name]: value
        }
      },
      userContext
    });
  } catch (err) {
    const errMsg = err == null ? void 0 : err.message;
    if (errMsg.includes("SuperTokens core threw an error for a ") && errMsg.includes("with status code: 400")) {
      return {
        status: "INVALID_CONFIG_ERROR",
        message: errMsg.split(" and message: ")[1]
      };
    }
    throw err;
  }
  return {
    status: "OK"
  };
}
