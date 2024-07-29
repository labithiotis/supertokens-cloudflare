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
var generatePasswordResetToken_exports = {};
__export(generatePasswordResetToken_exports, {
  default: () => generatePasswordResetToken
});
module.exports = __toCommonJS(generatePasswordResetToken_exports);
var import_utils = require("../../../utils");
var import_utils2 = require("./utils");
async function generatePasswordResetToken(apiImplementation, tenantId, options, userContext) {
  if (apiImplementation.generatePasswordResetTokenPOST === void 0) {
    return false;
  }
  const requestBody = await options.req.getJSONBody();
  let formFields = await (0, import_utils2.validateFormFieldsOrThrowError)(
    options.config.resetPasswordUsingTokenFeature.formFieldsForGenerateTokenForm,
    requestBody.formFields,
    tenantId,
    userContext
  );
  let result = await apiImplementation.generatePasswordResetTokenPOST({
    formFields,
    tenantId,
    options,
    userContext
  });
  (0, import_utils.send200Response)(options.res, result);
  return true;
}
