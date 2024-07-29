import Recipe from "./recipe";
class Wrapper {
}
Wrapper.init = Recipe.init;
let init = Wrapper.init;
export {
  Wrapper as default,
  init
};
