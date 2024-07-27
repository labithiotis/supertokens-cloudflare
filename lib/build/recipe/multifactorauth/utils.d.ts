// @ts-nocheck
import type { TypeInput, TypeNormalisedInput, MFAClaimValue, MFARequirementList } from "./types";
import type { UserContext } from "../../types";
import type { SessionContainerInterface } from "../session/types";
import { RecipeUserId } from "../..";
export declare function validateAndNormaliseUserInput(config?: TypeInput): TypeNormalisedInput;
export declare const updateAndGetMFARelatedInfoInSession: (input: ({
    sessionRecipeUserId: RecipeUserId;
    tenantId: string;
    accessTokenPayload: any;
} | {
    session: SessionContainerInterface;
}) & {
    updatedFactorId?: string;
    userContext: UserContext;
}) => Promise<{
    completedFactors: MFAClaimValue["c"];
    mfaRequirementsForAuth: MFARequirementList;
    isMFARequirementsForAuthSatisfied: boolean;
}>;
