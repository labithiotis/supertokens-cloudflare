"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var usersGet_exports = {};
__export(usersGet_exports, {
  default: () => usersGet,
  getSearchParamsFromURL: () => getSearchParamsFromURL
});
module.exports = __toCommonJS(usersGet_exports);
var import_error = __toESM(require("../../../error"), 1);
var import__ = require("../../..");
var import_recipe = __toESM(require("../../usermetadata/recipe"), 1);
var import_usermetadata = __toESM(require("../../usermetadata"), 1);
async function usersGet(_, tenantId, options, userContext) {
  const req = options.req;
  const limit = options.req.getKeyValueFromQuery("limit");
  if (limit === void 0) {
    throw new import_error.default({
      message: "Missing required parameter 'limit'",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  let timeJoinedOrder = req.getKeyValueFromQuery("timeJoinedOrder");
  if (timeJoinedOrder === void 0) {
    timeJoinedOrder = "DESC";
  }
  if (timeJoinedOrder !== "ASC" && timeJoinedOrder !== "DESC") {
    throw new import_error.default({
      message: "Invalid value recieved for 'timeJoinedOrder'",
      type: import_error.default.BAD_INPUT_ERROR
    });
  }
  let paginationToken = options.req.getKeyValueFromQuery("paginationToken");
  const query = getSearchParamsFromURL(options.req.getOriginalURL());
  let usersResponse = timeJoinedOrder === "DESC" ? await (0, import__.getUsersNewestFirst)({
    tenantId,
    query,
    limit: parseInt(limit),
    paginationToken
  }) : await (0, import__.getUsersOldestFirst)({
    tenantId,
    query,
    limit: parseInt(limit),
    paginationToken
  });
  try {
    import_recipe.default.getInstanceOrThrowError();
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
          const userMetaDataResponse = await import_usermetadata.default.getUserMetadata(userObj.id, userContext);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getSearchParamsFromURL
});
