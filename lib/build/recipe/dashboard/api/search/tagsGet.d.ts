// @ts-nocheck
import type { APIInterface, APIOptions } from "../../types";
import type { UserContext } from "../../../../types";
type TagsResponse = {
    status: "OK";
    tags: string[];
};
export declare const getSearchTags: (_: APIInterface, ___: string, options: APIOptions, userContext: UserContext) => Promise<TagsResponse>;
export {};
