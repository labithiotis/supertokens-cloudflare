const _PostSuperTokensInitCallbacks = class _PostSuperTokensInitCallbacks {
  static addPostInitCallback(cb) {
    _PostSuperTokensInitCallbacks.postInitCallbacks.push(cb);
  }
  static runPostInitCallbacks() {
    for (const cb of _PostSuperTokensInitCallbacks.postInitCallbacks) {
      cb();
    }
    _PostSuperTokensInitCallbacks.postInitCallbacks = [];
  }
};
_PostSuperTokensInitCallbacks.postInitCallbacks = [];
let PostSuperTokensInitCallbacks = _PostSuperTokensInitCallbacks;
export {
  PostSuperTokensInitCallbacks
};
