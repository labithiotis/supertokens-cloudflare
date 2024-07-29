const _SuperTokensError = class _SuperTokensError extends Error {
  constructor(options) {
    super(options.message);
    this.type = options.type;
    this.payload = options.payload;
    this.errMagic = _SuperTokensError.errMagic;
  }
  static isErrorFromSuperTokens(obj) {
    return obj.errMagic === _SuperTokensError.errMagic;
  }
};
_SuperTokensError.errMagic = "ndskajfasndlfkj435234krjdsa";
_SuperTokensError.BAD_INPUT_ERROR = "BAD_INPUT_ERROR";
let SuperTokensError = _SuperTokensError;
export {
  SuperTokensError as default
};
