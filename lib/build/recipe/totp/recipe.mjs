import OverrideableBuilder from "supertokens-js-override";
import NormalisedURLPath from "../../normalisedURLPath";
import { Querier } from "../../querier";
import RecipeModule from "../../recipeModule";
import STError from "../../error";
import RecipeImplementation from "./recipeImplementation";
import APIImplementation from "./api/implementation";
import {
  CREATE_TOTP_DEVICE,
  VERIFY_TOTP_DEVICE,
  VERIFY_TOTP,
  LIST_TOTP_DEVICES,
  REMOVE_TOTP_DEVICE
} from "./constants";
import { validateAndNormaliseUserInput } from "./utils";
import createDeviceAPI from "./api/createDevice";
import verifyDeviceAPI from "./api/verifyDevice";
import verifyTOTPAPI from "./api/verifyTOTP";
import listDevicesAPI from "./api/listDevices";
import removeDeviceAPI from "./api/removeDevice";
import { PostSuperTokensInitCallbacks } from "../../postSuperTokensInitCallbacks";
import MultiFactorAuthRecipe from "../multifactorauth/recipe";
import { env } from "node:process";
const _Recipe = class _Recipe extends RecipeModule {
  constructor(recipeId, appInfo, isInServerlessEnv, config) {
    super(recipeId, appInfo);
    // abstract instance functions below...............
    this.getAPIsHandled = () => {
      return [
        {
          method: "post",
          pathWithoutApiBasePath: new NormalisedURLPath(CREATE_TOTP_DEVICE),
          id: CREATE_TOTP_DEVICE,
          disabled: this.apiImpl.createDevicePOST === void 0
        },
        {
          method: "get",
          pathWithoutApiBasePath: new NormalisedURLPath(LIST_TOTP_DEVICES),
          id: LIST_TOTP_DEVICES,
          disabled: this.apiImpl.listDevicesGET === void 0
        },
        {
          method: "post",
          pathWithoutApiBasePath: new NormalisedURLPath(REMOVE_TOTP_DEVICE),
          id: REMOVE_TOTP_DEVICE,
          disabled: this.apiImpl.removeDevicePOST === void 0
        },
        {
          method: "post",
          pathWithoutApiBasePath: new NormalisedURLPath(VERIFY_TOTP_DEVICE),
          id: VERIFY_TOTP_DEVICE,
          disabled: this.apiImpl.verifyDevicePOST === void 0
        },
        {
          method: "post",
          pathWithoutApiBasePath: new NormalisedURLPath(VERIFY_TOTP),
          id: VERIFY_TOTP,
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
      if (id === CREATE_TOTP_DEVICE) {
        return await createDeviceAPI(this.apiImpl, options, userContext);
      } else if (id === LIST_TOTP_DEVICES) {
        return await listDevicesAPI(this.apiImpl, options, userContext);
      } else if (id === REMOVE_TOTP_DEVICE) {
        return await removeDeviceAPI(this.apiImpl, options, userContext);
      } else if (id === VERIFY_TOTP_DEVICE) {
        return await verifyDeviceAPI(this.apiImpl, options, userContext);
      } else if (id === VERIFY_TOTP) {
        return await verifyTOTPAPI(this.apiImpl, options, userContext);
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
      return STError.isErrorFromSuperTokens(err) && err.fromRecipe === _Recipe.RECIPE_ID;
    };
    this.config = validateAndNormaliseUserInput(appInfo, config);
    this.isInServerlessEnv = isInServerlessEnv;
    {
      let builder = new OverrideableBuilder(
        RecipeImplementation(Querier.getNewInstanceOrThrowError(recipeId), this.config)
      );
      this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
    }
    {
      let builder = new OverrideableBuilder(APIImplementation());
      this.apiImpl = builder.override(this.config.override.apis).build();
    }
    PostSuperTokensInitCallbacks.addPostInitCallback(() => {
      const mfaInstance = MultiFactorAuthRecipe.getInstance();
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
    if (env.TEST_MODE !== "testing") {
      throw new Error("calling testing function in non testing env");
    }
    _Recipe.instance = void 0;
  }
};
_Recipe.instance = void 0;
_Recipe.RECIPE_ID = "totp";
let Recipe = _Recipe;
export {
  Recipe as default
};
