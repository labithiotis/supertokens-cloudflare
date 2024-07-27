export default class RecipeUserId {
    constructor(recipeUserId) {
        this.getAsString = () => {
            return this.recipeUserId;
        };
        if (recipeUserId === undefined) {
            throw new Error("recipeUserId cannot be undefined. Please check for bugs in code");
        }
        this.recipeUserId = recipeUserId;
    }
}
