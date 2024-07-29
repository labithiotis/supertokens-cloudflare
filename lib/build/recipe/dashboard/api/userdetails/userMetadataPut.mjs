import UserMetadaRecipe from "../../../usermetadata/recipe";
import UserMetaData from "../../../usermetadata";
import STError from "../../../../error";
const userMetadataPut = async (_, ___, options, userContext) => {
  const requestBody = await options.req.getJSONBody();
  const userId = requestBody.userId;
  const data = requestBody.data;
  UserMetadaRecipe.getInstanceOrThrowError();
  if (userId === void 0 || typeof userId !== "string") {
    throw new STError({
      message: "Required parameter 'userId' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  if (data === void 0 || typeof data !== "string") {
    throw new STError({
      message: "Required parameter 'data' is missing or has an invalid type",
      type: STError.BAD_INPUT_ERROR
    });
  }
  try {
    let parsedData = JSON.parse(data);
    if (typeof parsedData !== "object") {
      throw new Error();
    }
    if (Array.isArray(parsedData)) {
      throw new Error();
    }
    if (parsedData === null) {
      throw new Error();
    }
  } catch (e) {
    throw new STError({
      message: "'data' must be a valid JSON body",
      type: STError.BAD_INPUT_ERROR
    });
  }
  await UserMetaData.clearUserMetadata(userId, userContext);
  await UserMetaData.updateUserMetadata(userId, JSON.parse(data), userContext);
  return {
    status: "OK"
  };
};
export {
  userMetadataPut
};
