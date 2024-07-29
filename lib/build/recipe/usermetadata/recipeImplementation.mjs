import NormalisedURLPath from "../../normalisedURLPath";
function getRecipeInterface(querier) {
  return {
    getUserMetadata: function({ userId, userContext }) {
      return querier.sendGetRequest(new NormalisedURLPath("/recipe/user/metadata"), { userId }, userContext);
    },
    updateUserMetadata: function({ userId, metadataUpdate, userContext }) {
      return querier.sendPutRequest(
        new NormalisedURLPath("/recipe/user/metadata"),
        {
          userId,
          metadataUpdate
        },
        userContext
      );
    },
    clearUserMetadata: function({ userId, userContext }) {
      return querier.sendPostRequest(
        new NormalisedURLPath("/recipe/user/metadata/remove"),
        {
          userId
        },
        userContext
      );
    }
  };
}
export {
  getRecipeInterface as default
};
