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
var implementation_exports = {};
__export(implementation_exports, {
  default: () => getAPIImplementation
});
module.exports = __toCommonJS(implementation_exports);
var import_normalisedURLDomain = __toESM(require("../../../normalisedURLDomain"), 1);
var import_normalisedURLPath = __toESM(require("../../../normalisedURLPath"), 1);
var import_querier = require("../../../querier");
var import_supertokens = __toESM(require("../../../supertokens"), 1);
var import_utils = require("../../../utils");
var import_constants = require("../constants");
function getAPIImplementation() {
  return {
    dashboardGET: async function(input) {
      const bundleBasePathString = await input.options.recipeImplementation.getDashboardBundleLocation({
        userContext: input.userContext
      });
      const bundleDomain = new import_normalisedURLDomain.default(bundleBasePathString).getAsStringDangerous() + new import_normalisedURLPath.default(bundleBasePathString).getAsStringDangerous();
      let connectionURI = "";
      const superTokensInstance = import_supertokens.default.getInstanceOrThrowError();
      const authMode = input.options.config.authMode;
      if (superTokensInstance.supertokens !== void 0) {
        connectionURI = new import_normalisedURLDomain.default(
          superTokensInstance.supertokens.connectionURI.split(";")[0]
        ).getAsStringDangerous() + new import_normalisedURLPath.default(
          superTokensInstance.supertokens.connectionURI.split(";")[0]
        ).getAsStringDangerous();
      }
      let isSearchEnabled = false;
      const cdiVersion = await import_querier.Querier.getNewInstanceOrThrowError(input.options.recipeId).getAPIVersion(
        input.userContext
      );
      if ((0, import_utils.maxVersion)("2.20", cdiVersion) === cdiVersion) {
        isSearchEnabled = true;
      }
      const htmlContent = `
            '<div class="csp-screen-container">' +
            '<div>' +
            '<p>It looks like you have encountered a <u>Content Security Policy (CSP) </u> violation while trying to load a resource. Here is the breakdown of the details:</p>' +
            '<span class="csp-screen-point"><strong>Blocked URI:</strong> ' + event.blockedURI + '<br></span>' +
            '<span class="csp-screen-point"><strong>Violated Directive:</strong> ' + event.violatedDirective + '<br></span>' +
            '<span class="csp-screen-point"><strong>Original Policy:</strong> ' + event.originalPolicy + '<br></span>' +
            '<p>To resolve this issue, you will need to update your CSP configuration to allow the blocked URI.</p>' +
            '</div>' +
            '</div>'`;
      return `
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <script>
                        window.addEventListener('securitypolicyviolation', function (event) {
                            const root = document.getElementById("root");
                            root.innerHTML = ${htmlContent}
                        });
                        window.staticBasePath = "${bundleDomain}/static"
                        window.dashboardAppPath = "${input.options.appInfo.apiBasePath.appendPath(new import_normalisedURLPath.default(import_constants.DASHBOARD_API)).getAsStringDangerous()}"
                        window.connectionURI = "${connectionURI}"
                        window.authMode = "${authMode}"
                        window.isSearchEnabled = "${isSearchEnabled}"
                    </script>

                    <style>
                        .csp-screen-container{
                            display: flex;
                            height: 100vh;
                            align-items: center;
                            justify-content: center;
                            max-width: 480px;
                            margin: auto;

                            font-size: 16px;
                        }
                        .csp-screen-point{
                            display: inline-block;
                            margin: 4px 0px;
                        }
                    </style>

                    <script defer src="${bundleDomain}/static/js/bundle.js"></script>
                    <link href="${bundleDomain}/static/css/main.css" rel="stylesheet" type="text/css">
                    <link rel="icon" type="image/x-icon" href="${bundleDomain}/static/media/favicon.ico">
                </head>
                <body>
                    <noscript>You need to enable JavaScript to run this app.</noscript>
                    <div id="root"></div>
                </body>
            </html>
            `;
    }
  };
}
