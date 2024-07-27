// @ts-nocheck
import type { NormalisedAppinfo } from "../../types";
import type { TypeInput, TypeNormalisedInput } from "./types";
export declare function validateAndNormaliseUserInput(appInfo: NormalisedAppinfo, config?: TypeInput): TypeNormalisedInput;
export declare function isFakeEmail(email: string): boolean;
