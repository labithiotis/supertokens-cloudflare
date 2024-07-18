import NewProvider from "./custom";
export default function Discord(input) {
    var _a;
    if (input.config.name === undefined) {
        input.config.name = "Discord";
    }
    if (input.config.authorizationEndpoint === undefined) {
        input.config.authorizationEndpoint = "https://discord.com/oauth2/authorize";
    }
    if (input.config.tokenEndpoint === undefined) {
        input.config.tokenEndpoint = "https://discord.com/api/oauth2/token";
    }
    if (input.config.userInfoEndpoint === undefined) {
        input.config.userInfoEndpoint = "https://discord.com/api/users/@me";
    }
    input.config.userInfoMap = Object.assign(Object.assign({}, input.config.userInfoMap), {
        fromUserInfoAPI: Object.assign(
            { userId: "id", email: "email", emailVerified: "verified" },
            (_a = input.config.userInfoMap) === null || _a === void 0 ? void 0 : _a.fromUserInfoAPI
        ),
    });
    const oOverride = input.override;
    input.override = function (originalImplementation) {
        const oGetConfig = originalImplementation.getConfigForClientType;
        originalImplementation.getConfigForClientType = async function ({ clientType, userContext }) {
            const config = await oGetConfig({ clientType, userContext });
            if (config.scope === undefined) {
                config.scope = ["identify", "email"];
            }
            return config;
        };
        if (oOverride !== undefined) {
            originalImplementation = oOverride(originalImplementation);
        }
        return originalImplementation;
    };
    return NewProvider(input);
}
