class RecipeUserId {
  constructor(recipeUserId) {
    this.getAsString = () => {
      return this.recipeUserId;
    };
    if (recipeUserId === void 0) {
      throw new Error("recipeUserId cannot be undefined. Please check for bugs in code");
    }
    this.recipeUserId = recipeUserId;
  }
}
export {
  RecipeUserId as default
};
