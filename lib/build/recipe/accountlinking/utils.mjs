var __defProp = Object.defineProperty;
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
async function defaultOnAccountLinked() {
}
async function defaultShouldDoAutomaticAccountLinking() {
  return {
    shouldAutomaticallyLink: false
  };
}
function recipeInitDefinedShouldDoAutomaticAccountLinking(config) {
  return config.shouldDoAutomaticAccountLinking !== defaultShouldDoAutomaticAccountLinking;
}
function validateAndNormaliseUserInput(_, config) {
  let onAccountLinked = (config == null ? void 0 : config.onAccountLinked) || defaultOnAccountLinked;
  let shouldDoAutomaticAccountLinking = (config == null ? void 0 : config.shouldDoAutomaticAccountLinking) || defaultShouldDoAutomaticAccountLinking;
  let override = __spreadValues({
    functions: (originalImplementation) => originalImplementation
  }, config == null ? void 0 : config.override);
  return {
    override,
    onAccountLinked,
    shouldDoAutomaticAccountLinking
  };
}
export {
  recipeInitDefinedShouldDoAutomaticAccountLinking,
  validateAndNormaliseUserInput
};
