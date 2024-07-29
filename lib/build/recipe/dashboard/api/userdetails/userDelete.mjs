import STError from "../../../../error";
import { deleteUser } from "../../../..";
const userDelete = async (_, ___, options, __) => {
  const userId = options.req.getKeyValueFromQuery("userId");
  let removeAllLinkedAccountsQueryValue = options.req.getKeyValueFromQuery("removeAllLinkedAccounts");
  if (removeAllLinkedAccountsQueryValue !== void 0) {
    removeAllLinkedAccountsQueryValue = removeAllLinkedAccountsQueryValue.trim().toLowerCase();
  }
  const removeAllLinkedAccounts = removeAllLinkedAccountsQueryValue === void 0 ? void 0 : removeAllLinkedAccountsQueryValue === "true";
  if (userId === void 0 || userId === "") {
    throw new STError({
      message: "Missing required parameter 'userId'",
      type: STError.BAD_INPUT_ERROR
    });
  }
  await deleteUser(userId, removeAllLinkedAccounts);
  return {
    status: "OK"
  };
};
export {
  userDelete
};
