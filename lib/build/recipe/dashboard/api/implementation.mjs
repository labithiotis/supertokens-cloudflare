import NormalisedURLDomain from "../../../normalisedURLDomain";
import NormalisedURLPath from "../../../normalisedURLPath";
import { Querier } from "../../../querier";
import SuperTokens from "../../../supertokens";
import { maxVersion } from "../../../utils";
import { DASHBOARD_API } from "../constants";
function getAPIImplementation() {
  return {
    dashboardGET: async function(input) {
      const bundleBasePathString = await input.options.recipeImplementation.getDashboardBundleLocation({
        userContext: input.userContext
      });
      const bundleDomain = new NormalisedURLDomain(bundleBasePathString).getAsStringDangerous() + new NormalisedURLPath(bundleBasePathString).getAsStringDangerous();
      let connectionURI = "";
      const superTokensInstance = SuperTokens.getInstanceOrThrowError();
      const authMode = input.options.config.authMode;
      if (superTokensInstance.supertokens !== void 0) {
        connectionURI = new NormalisedURLDomain(
          superTokensInstance.supertokens.connectionURI.split(";")[0]
        ).getAsStringDangerous() + new NormalisedURLPath(
          superTokensInstance.supertokens.connectionURI.split(";")[0]
        ).getAsStringDangerous();
      }
      let isSearchEnabled = false;
      const cdiVersion = await Querier.getNewInstanceOrThrowError(input.options.recipeId).getAPIVersion(
        input.userContext
      );
      if (maxVersion("2.20", cdiVersion) === cdiVersion) {
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
                        window.dashboardAppPath = "${input.options.appInfo.apiBasePath.appendPath(new NormalisedURLPath(DASHBOARD_API)).getAsStringDangerous()}"
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
export {
  getAPIImplementation as default
};
