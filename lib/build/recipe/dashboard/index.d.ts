// @ts-nocheck
import Recipe from "./recipe";
import type { RecipeInterface, APIOptions, APIInterface } from "./types";
export default class Wrapper {
    static init: typeof Recipe.init;
}
export declare let init: typeof Recipe.init;
export type { RecipeInterface, APIOptions, APIInterface };
