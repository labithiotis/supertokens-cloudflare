function getAPIImplementation() {
  return {
    getJWKSGET: async function({
      options,
      userContext
    }) {
      const resp = await options.recipeImplementation.getJWKS({ userContext });
      if (resp.validityInSeconds !== void 0) {
        options.res.setHeader("Cache-Control", `max-age=${resp.validityInSeconds}, must-revalidate`, false);
      }
      return {
        keys: resp.keys
      };
    }
  };
}
export {
  getAPIImplementation as default
};
