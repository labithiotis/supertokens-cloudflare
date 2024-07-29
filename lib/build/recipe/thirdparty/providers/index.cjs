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
var providers_exports = {};
__export(providers_exports, {
  ActiveDirectory: () => ActiveDirectory,
  Apple: () => Apple,
  Bitbucket: () => Bitbucket,
  BoxySAML: () => BoxySAML,
  Discord: () => Discord,
  Facebook: () => Facebook,
  Github: () => Github,
  Gitlab: () => Gitlab,
  Google: () => Google,
  GoogleWorkspaces: () => GoogleWorkspaces,
  Linkedin: () => Linkedin,
  Okta: () => Okta,
  Twitter: () => Twitter
});
module.exports = __toCommonJS(providers_exports);
var import_activeDirectory = __toESM(require("./activeDirectory"), 1);
var import_boxySaml = __toESM(require("./boxySaml"), 1);
var import_apple = __toESM(require("./apple"), 1);
var import_discord = __toESM(require("./discord"), 1);
var import_facebook = __toESM(require("./facebook"), 1);
var import_github = __toESM(require("./github"), 1);
var import_google = __toESM(require("./google"), 1);
var import_googleWorkspaces = __toESM(require("./googleWorkspaces"), 1);
var import_linkedin = __toESM(require("./linkedin"), 1);
var import_okta = __toESM(require("./okta"), 1);
var import_bitbucket = __toESM(require("./bitbucket"), 1);
var import_gitlab = __toESM(require("./gitlab"), 1);
var import_twitter = __toESM(require("./twitter"), 1);
let ActiveDirectory = import_activeDirectory.default;
let BoxySAML = import_boxySaml.default;
let Apple = import_apple.default;
let Discord = import_discord.default;
let Facebook = import_facebook.default;
let Github = import_github.default;
let Google = import_google.default;
let GoogleWorkspaces = import_googleWorkspaces.default;
let Linkedin = import_linkedin.default;
let Okta = import_okta.default;
let Bitbucket = import_bitbucket.default;
let Gitlab = import_gitlab.default;
let Twitter = import_twitter.default;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ActiveDirectory,
  Apple,
  Bitbucket,
  BoxySAML,
  Discord,
  Facebook,
  Github,
  Gitlab,
  Google,
  GoogleWorkspaces,
  Linkedin,
  Okta,
  Twitter
});
