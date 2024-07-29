const REFRESH_API_PATH = "/session/refresh";
const SIGNOUT_API_PATH = "/signout";
const availableTokenTransferMethods = ["cookie", "header"];
const oneYearInMs = 31536e6;
const JWKCacheCooldownInMs = 500;
const protectedProps = [
  "sub",
  "iat",
  "exp",
  "sessionHandle",
  "parentRefreshTokenHash1",
  "refreshTokenHash1",
  "antiCsrfToken",
  "rsub",
  "tId"
];
export {
  JWKCacheCooldownInMs,
  REFRESH_API_PATH,
  SIGNOUT_API_PATH,
  availableTokenTransferMethods,
  oneYearInMs,
  protectedProps
};
