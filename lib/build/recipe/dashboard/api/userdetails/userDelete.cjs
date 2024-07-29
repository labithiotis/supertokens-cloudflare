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
var userDelete_exports = {};
__export(userDelete_exports, {
  userDelete: () => userDelete
});
module.exports = __toCommonJS(userDelete_exports);
var import_error = __toESM(require("../../../../error"), 1);
var import__ = require("../../../..");
const userDelete = async (_, ___, options, __) => {
  const userId = options.req.getKeyValueFromQuery("userId");
  let removeAllLinkedAccountsQueryValue = options.req.getKeyValueFromQuery("removeAllLinkedAccounts");
  if (removeAllLinkedAccountsQueryValue !== void 0) {
    removeAllLinkedAccountsQueryValue = removeAllLinkedAccountsQueryValue.trim().toLowerCase();
  }
  const removeAllLinkedAccounts = removeAllLinkedAccountsQueryValue === void 0 ? void 0 : removeAllLinkedAccountsQueryValue === "true";
  if (userId === void 0 || userId === "") {
    throw new import_error.default({
      message: "Missing required parameter 'userId'",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  await (0, import__.deleteUser)(userId, removeAllLinkedAccounts);
  return {
    status: "OK"
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  userDelete
});
