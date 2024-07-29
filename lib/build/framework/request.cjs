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
var request_exports = {};
__export(request_exports, {
  BaseRequest: () => BaseRequest
});
module.exports = __toCommonJS(request_exports);
class BaseRequest {
  constructor() {
    // Note: While it's not recommended to override this method in child classes,
    // if necessary, implement a similar caching strategy to ensure that `getFormDataFromRequestBody` is called only once.
    this.getFormData = async () => {
      if (this.parsedUrlEncodedFormData === void 0) {
        this.parsedUrlEncodedFormData = await this.getFormDataFromRequestBody();
      }
      if (typeof FormData !== "undefined" && this.parsedUrlEncodedFormData instanceof FormData) {
        const ret = {};
        this.parsedUrlEncodedFormData.forEach((value, key) => ret[key] = value);
        return ret;
      }
      return this.parsedUrlEncodedFormData;
    };
    // Note: While it's not recommended to override this method in child classes,
    // if necessary, implement a similar caching strategy to ensure that `getJSONFromRequestBody` is called only once.
    this.getJSONBody = async () => {
      if (this.parsedJSONBody === void 0) {
        this.parsedJSONBody = await this.getJSONFromRequestBody();
      }
      return this.parsedJSONBody;
    };
    this.wrapperUsed = true;
    this.parsedJSONBody = void 0;
    this.parsedUrlEncodedFormData = void 0;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BaseRequest
});
