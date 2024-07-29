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
var import_normalisedURLPath = __toESM(require("../../normalisedURLPath"), 1);
var import_querier = require("../../querier");
var import_recipeModule = __toESM(require("../../recipeModule"), 1);
var import_error = __toESM(require("../../error"), 1);
var import_recipeImplementation = __toESM(require("./recipeImplementation"), 1);
var import_implementation = __toESM(require("./api/implementation"), 1);
var import_constants = require("./constants");
var import_utils = require("./utils");
var import_createDevice = __toESM(require("./api/createDevice"), 1);
var import_verifyDevice = __toESM(require("./api/verifyDevice"), 1);
var import_verifyTOTP = __toESM(require("./api/verifyTOTP"), 1);
var import_listDevices = __toESM(require("./api/listDevices"), 1);
var import_removeDevice = __toESM(require("./api/removeDevice"), 1);
var import_postSuperTokensInitCallbacks = require("../../postSuperTokensInitCallbacks");
var import_recipe = __toESM(require("../multifactorauth/recipe"), 1);
var import_node_process = require("node:process");
const _Recipe = class _Recipe extends import_recipeModule.default {
  constructor(recipeId, appInfo, isInServerlessEnv, config) {
    super(recipeId, appInfo);
    // abstract instance functions below...............
    this.getAPIsHandled = () => {
      return [
        {
          method: "post",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.CREATE_TOTP_DEVICE),
          id: import_constants.CREATE_TOTP_DEVICE,
          disabled: this.apiImpl.createDevicePOST === void 0
        },
        {
          method: "get",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.LIST_TOTP_DEVICES),
          id: import_constants.LIST_TOTP_DEVICES,
          disabled: this.apiImpl.listDevicesGET === void 0
        },
        {
          method: "post",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.REMOVE_TOTP_DEVICE),
          id: import_constants.REMOVE_TOTP_DEVICE,
          disabled: this.apiImpl.removeDevicePOST === void 0
        },
        {
          method: "post",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.VERIFY_TOTP_DEVICE),
          id: import_constants.VERIFY_TOTP_DEVICE,
          disabled: this.apiImpl.verifyDevicePOST === void 0
        },
        {
          method: "post",
          pathWithoutApiBasePath: new import_normalisedURLPath.default(import_constants.VERIFY_TOTP),
          id: import_constants.VERIFY_TOTP,
          disabled: this.apiImpl.verifyTOTPPOST === void 0
        }
      ];
    };
    this.handleAPIRequest = async (id, _tenantId, req, res, _, __, userContext) => {
      let options = {
        recipeImplementation: this.recipeInterfaceImpl,
        config: this.config,
        recipeId: this.getRecipeId(),
        isInServerlessEnv: this.isInServerlessEnv,
        req,
        res
      };
      if (id === import_constants.CREATE_TOTP_DEVICE) {
        return await (0, import_createDevice.default)(this.apiImpl, options, userContext);
      } else if (id === import_constants.LIST_TOTP_DEVICES) {
        return await (0, import_listDevices.default)(this.apiImpl, options, userContext);
      } else if (id === import_constants.REMOVE_TOTP_DEVICE) {
        return await (0, import_removeDevice.default)(this.apiImpl, options, userContext);
      } else if (id === import_constants.VERIFY_TOTP_DEVICE) {
        return await (0, import_verifyDevice.default)(this.apiImpl, options, userContext);
      } else if (id === import_constants.VERIFY_TOTP) {
        return await (0, import_verifyTOTP.default)(this.apiImpl, options, userContext);
      }
      throw new Error("should never come here");
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
    this.config = (0, import_utils.validateAndNormaliseUserInput)(appInfo, config);
    this.isInServerlessEnv = isInServerlessEnv;
    {
      let builder = new import_supertokens_js_override.default(
        (0, import_recipeImplementation.default)(import_querier.Querier.getNewInstanceOrThrowError(recipeId), this.config)
      );
      this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
    }
    {
      let builder = new import_supertokens_js_override.default((0, import_implementation.default)());
      this.apiImpl = builder.override(this.config.override.apis).build();
    }
    import_postSuperTokensInitCallbacks.PostSuperTokensInitCallbacks.addPostInitCallback(() => {
      const mfaInstance = import_recipe.default.getInstance();
      if (mfaInstance !== void 0) {
        mfaInstance.addFuncToGetAllAvailableSecondaryFactorIdsFromOtherRecipes(() => {
          return ["totp"];
        });
        mfaInstance.addFuncToGetFactorsSetupForUserFromOtherRecipes(
          async (user, userContext) => {
            const deviceRes = await _Recipe.getInstanceOrThrowError().recipeInterfaceImpl.listDevices({
              userId: user.id,
              userContext
            });
            for (const device of deviceRes.devices) {
              if (device.verified) {
                return ["totp"];
              }
            }
            return [];
          }
        );
      }
    });
  }
  static getInstanceOrThrowError() {
    if (_Recipe.instance !== void 0) {
      return _Recipe.instance;
    }
    throw new Error("Initialisation not done. Did you forget to call the Totp.init function?");
  }
  static getInstance() {
    return _Recipe.instance;
  }
  static init(config) {
    return (appInfo, isInServerlessEnv) => {
      if (_Recipe.instance === void 0) {
        _Recipe.instance = new _Recipe(_Recipe.RECIPE_ID, appInfo, isInServerlessEnv, config);
        return _Recipe.instance;
      } else {
        throw new Error("TOTP recipe has already been initialised. Please check your code for bugs.");
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
_Recipe.RECIPE_ID = "totp";
let Recipe = _Recipe;
