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
var normalisedURLDomain_exports = {};
__export(normalisedURLDomain_exports, {
  default: () => NormalisedURLDomain
});
module.exports = __toCommonJS(normalisedURLDomain_exports);
var import_utils = require("./utils");
class NormalisedURLDomain {
  constructor(url) {
    this.getAsStringDangerous = () => {
      return this.value;
    };
    this.value = normaliseURLDomainOrThrowError(url);
  }
}
function normaliseURLDomainOrThrowError(input, ignoreProtocol = false) {
  input = input.trim().toLowerCase();
  try {
    if (!input.startsWith("http://") && !input.startsWith("https://") && !input.startsWith("supertokens://")) {
      throw new Error("converting to proper URL");
    }
    let urlObj = new URL(input);
    if (ignoreProtocol) {
      if (urlObj.hostname.startsWith("localhost") || (0, import_utils.isAnIpAddress)(urlObj.hostname)) {
        input = "http://" + urlObj.host;
      } else {
        input = "https://" + urlObj.host;
      }
    } else {
      input = urlObj.protocol + "//" + urlObj.host;
    }
    return input;
  } catch (err) {
  }
  if (input.startsWith("/")) {
    throw Error("Please provide a valid domain name");
  }
  if (input.indexOf(".") === 0) {
    input = input.substr(1);
  }
  if ((input.indexOf(".") !== -1 || input.startsWith("localhost")) && !input.startsWith("http://") && !input.startsWith("https://")) {
    input = "https://" + input;
    try {
      new URL(input);
      return normaliseURLDomainOrThrowError(input, true);
    } catch (err) {
    }
  }
  throw Error("Please provide a valid domain name");
}
