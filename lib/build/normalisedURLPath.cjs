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
var normalisedURLPath_exports = {};
__export(normalisedURLPath_exports, {
  default: () => NormalisedURLPath
});
module.exports = __toCommonJS(normalisedURLPath_exports);
class NormalisedURLPath {
  constructor(url) {
    this.startsWith = (other) => {
      return this.value.startsWith(other.value);
    };
    this.appendPath = (other) => {
      return new NormalisedURLPath(this.value + other.value);
    };
    this.getAsStringDangerous = () => {
      return this.value;
    };
    this.equals = (other) => {
      return this.value === other.value;
    };
    this.isARecipePath = () => {
      const parts = this.value.split("/");
      return parts[1] === "recipe" || parts[2] === "recipe";
    };
    this.value = normaliseURLPathOrThrowError(url);
  }
}
function normaliseURLPathOrThrowError(input) {
  input = input.trim().toLowerCase();
  try {
    if (!input.startsWith("http://") && !input.startsWith("https://")) {
      throw new Error("converting to proper URL");
    }
    let urlObj = new URL(input);
    input = urlObj.pathname;
    if (input.charAt(input.length - 1) === "/") {
      return input.substr(0, input.length - 1);
    }
    return input;
  } catch (err) {
  }
  if ((domainGiven(input) || input.startsWith("localhost")) && !input.startsWith("http://") && !input.startsWith("https://")) {
    input = "http://" + input;
    return normaliseURLPathOrThrowError(input);
  }
  if (input.charAt(0) !== "/") {
    input = "/" + input;
  }
  try {
    new URL("http://example.com" + input);
    return normaliseURLPathOrThrowError("http://example.com" + input);
  } catch (err) {
    throw Error("Please provide a valid URL path");
  }
}
function domainGiven(input) {
  if (input.indexOf(".") === -1 || input.startsWith("/")) {
    return false;
  }
  try {
    let url = new URL(input);
    return url.hostname.indexOf(".") !== -1;
  } catch (ignored) {
  }
  try {
    let url = new URL("http://" + input);
    return url.hostname.indexOf(".") !== -1;
  } catch (ignored) {
  }
  return false;
}
