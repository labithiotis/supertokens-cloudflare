import STError from "../../error";
const _DashboardError = class _DashboardError extends STError {
  constructor(message) {
    super({
      message: message !== void 0 ? message : "You are not permitted to perform this operation",
      type: _DashboardError.OPERATION_NOT_ALLOWED
    });
  }
};
_DashboardError.OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED";
let DashboardError = _DashboardError;
export {
  DashboardError as default
};
