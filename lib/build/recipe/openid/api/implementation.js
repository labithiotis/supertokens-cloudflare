export default function getAPIImplementation() {
    return {
        getOpenIdDiscoveryConfigurationGET: async function ({ options, userContext, }) {
            return await options.recipeImplementation.getOpenIdDiscoveryConfiguration({ userContext });
        },
    };
}
