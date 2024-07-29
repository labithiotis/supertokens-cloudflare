var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
import STError from "../../../error";
import { getUsersNewestFirst, getUsersOldestFirst } from "../../..";
import UserMetaDataRecipe from "../../usermetadata/recipe";
import UserMetaData from "../../usermetadata";
async function usersGet(_, tenantId, options, userContext) {
  const req = options.req;
  const limit = options.req.getKeyValueFromQuery("limit");
  if (limit === void 0) {
    throw new STError({
      message: "Missing required parameter 'limit'",
      type: STError.BAD_INPUT_ERROR
    });
  }
  let timeJoinedOrder = req.getKeyValueFromQuery("timeJoinedOrder");
  if (timeJoinedOrder === void 0) {
    timeJoinedOrder = "DESC";
  }
  if (timeJoinedOrder !== "ASC" && timeJoinedOrder !== "DESC") {
    throw new STError({
      message: "Invalid value recieved for 'timeJoinedOrder'",
      type: STError.BAD_INPUT_ERROR
    });
  }
  let paginationToken = options.req.getKeyValueFromQuery("paginationToken");
  const query = getSearchParamsFromURL(options.req.getOriginalURL());
  let usersResponse = timeJoinedOrder === "DESC" ? await getUsersNewestFirst({
    tenantId,
    query,
    limit: parseInt(limit),
    paginationToken
  }) : await getUsersOldestFirst({
    tenantId,
    query,
    limit: parseInt(limit),
    paginationToken
  });
  try {
    UserMetaDataRecipe.getInstanceOrThrowError();
  } catch (e) {
    return {
      status: "OK",
      users: usersResponse.users.map((u) => u.toJson()),
      nextPaginationToken: usersResponse.nextPaginationToken
    };
  }
  let updatedUsersArray = [];
  let metaDataFetchPromises = [];
  for (let i = 0; i < usersResponse.users.length; i++) {
    const userObj = usersResponse.users[i].toJson();
    metaDataFetchPromises.push(
      () => new Promise(async (resolve, reject) => {
        try {
          const userMetaDataResponse = await UserMetaData.getUserMetadata(userObj.id, userContext);
          const { first_name, last_name } = userMetaDataResponse.metadata;
          updatedUsersArray[i] = __spreadProps(__spreadValues({}, userObj), {
            firstName: first_name,
            lastName: last_name
          });
          resolve(true);
        } catch (e) {
          reject(e);
        }
      })
    );
  }
  let promiseArrayStartPosition = 0;
  let batchSize = 5;
  while (promiseArrayStartPosition < metaDataFetchPromises.length) {
    let promiseArrayEndPosition = promiseArrayStartPosition + (batchSize - 1);
    if (promiseArrayEndPosition >= metaDataFetchPromises.length) {
      promiseArrayEndPosition = promiseArrayStartPosition + (metaDataFetchPromises.length - 1 - promiseArrayStartPosition);
    }
    let promisesToCall = [];
    for (let j = promiseArrayStartPosition; j <= promiseArrayEndPosition; j++) {
      promisesToCall.push(metaDataFetchPromises[j]);
    }
    await Promise.all(promisesToCall.map((p) => p()));
    promiseArrayStartPosition += batchSize;
  }
  usersResponse = __spreadProps(__spreadValues({}, usersResponse), {
    users: updatedUsersArray
  });
  return {
    status: "OK",
    users: usersResponse.users,
    nextPaginationToken: usersResponse.nextPaginationToken
  };
}
function getSearchParamsFromURL(path) {
  const URLObject = new URL("https://exmaple.com" + path);
  const params = new URLSearchParams(URLObject.search);
  const searchQuery = {};
  for (const [key, value] of params) {
    if (!["limit", "timeJoinedOrder", "paginationToken"].includes(key)) {
      searchQuery[key] = value;
    }
  }
  return searchQuery;
}
export {
  usersGet as default,
  getSearchParamsFromURL
};
