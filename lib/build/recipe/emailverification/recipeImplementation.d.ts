// @ts-nocheck
import type { RecipeInterface } from "./";
import { Querier } from "../../querier";
import type { GetEmailForRecipeUserIdFunc } from "./types";
export default function getRecipeInterface(querier: Querier, getEmailForRecipeUserId: GetEmailForRecipeUserIdFunc): RecipeInterface;
