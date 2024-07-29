import { Querier } from "../../../../querier";
import NormalisedURLPath from "../../../../normalisedURLPath";
const getSearchTags = async (_, ___, options, userContext) => {
  let querier = Querier.getNewInstanceOrThrowError(options.recipeId);
  let tagsResponse = await querier.sendGetRequest(new NormalisedURLPath("/user/search/tags"), {}, userContext);
  return tagsResponse;
};
export {
  getSearchTags
};
