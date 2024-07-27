// @ts-nocheck
import type { NormalisedFormField } from "../types";
import type { UserContext } from "../../../types";
export declare function validateFormFieldsOrThrowError(configFormFields: NormalisedFormField[], formFieldsRaw: any, tenantId: string, userContext: UserContext): Promise<{
    id: string;
    value: string;
}[]>;
