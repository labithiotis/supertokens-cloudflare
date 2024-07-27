import NormalisedURLPath from "../../normalisedURLPath";
import { findAndCreateProviderInstance, mergeProvidersFromCoreAndStatic } from "./providers/configUtils";
import AccountLinking from "../accountlinking/recipe";
import MultitenancyRecipe from "../multitenancy/recipe";
import RecipeUserId from "../../recipeUserId";
import { getUser, listUsersByAccountInfo } from "../..";
import { User } from "../../user";
import { AuthUtils } from "../../authUtils";
import { DEFAULT_TENANT_ID } from "../multitenancy/constants";
export default function getRecipeImplementation(querier, providers) {
    return {
        manuallyCreateOrUpdateUser: async function ({ thirdPartyId, thirdPartyUserId, email, isVerified, tenantId, session, userContext }) {
            const accountLinking = AccountLinking.getInstance();
            const users = await listUsersByAccountInfo(tenantId, { thirdParty: { id: thirdPartyId, userId: thirdPartyUserId } }, false, userContext);
            const user = users[0];
            if (user !== undefined) {
                const isEmailChangeAllowed = await accountLinking.isEmailChangeAllowed({
                    user,
                    isVerified: isVerified,
                    newEmail: email,
                    session,
                    userContext: userContext,
                });
                if (!isEmailChangeAllowed.allowed) {
                    return {
                        status: "EMAIL_CHANGE_NOT_ALLOWED_ERROR",
                        reason: isEmailChangeAllowed.reason === "PRIMARY_USER_CONFLICT"
                            ? "Email already associated with another primary user."
                            : "New email cannot be applied to existing account because of account takeover risks.",
                    };
                }
            }
            let response = await querier.sendPostRequest(new NormalisedURLPath(`/${tenantId}/recipe/signinup`), {
                thirdPartyId,
                thirdPartyUserId,
                email: { id: email, isVerified },
            }, userContext);
            if (response.status !== "OK") {
                return response;
            }
            response.user = new User(response.user);
            response.recipeUserId = new RecipeUserId(response.recipeUserId);
            await AccountLinking.getInstance().verifyEmailForRecipeUserIfLinkedAccountsAreVerified({
                user: response.user,
                recipeUserId: response.recipeUserId,
                userContext,
            });
            // we do this so that we get the updated user (in case the above
            // function updated the verification status) and can return that
            response.user = (await getUser(response.recipeUserId.getAsString(), userContext));
            const linkResult = await AuthUtils.linkToSessionIfProvidedElseCreatePrimaryUserIdOrLinkByAccountInfo({
                tenantId,
                inputUser: response.user,
                recipeUserId: response.recipeUserId,
                session,
                userContext,
            });
            if (linkResult.status !== "OK") {
                return linkResult;
            }
            return {
                status: "OK",
                createdNewRecipeUser: response.createdNewUser,
                user: linkResult.user,
                recipeUserId: response.recipeUserId,
            };
        },
        signInUp: async function ({ thirdPartyId, thirdPartyUserId, email, isVerified, tenantId, userContext, oAuthTokens, session, rawUserInfoFromProvider, }) {
            let response = await this.manuallyCreateOrUpdateUser({
                thirdPartyId,
                thirdPartyUserId,
                email,
                tenantId,
                isVerified,
                session,
                userContext,
            });
            if (response.status === "EMAIL_CHANGE_NOT_ALLOWED_ERROR") {
                return {
                    status: "SIGN_IN_UP_NOT_ALLOWED",
                    reason: response.reason === "Email already associated with another primary user."
                        ? "Cannot sign in / up because new email cannot be applied to existing account. Please contact support. (ERR_CODE_005)"
                        : "Cannot sign in / up because new email cannot be applied to existing account. Please contact support. (ERR_CODE_024)",
                };
            }
            if (response.status === "OK") {
                return Object.assign(Object.assign({}, response), { oAuthTokens,
                    rawUserInfoFromProvider });
            }
            return response;
        },
        getProvider: async function ({ thirdPartyId, tenantId, clientType, userContext }) {
            const mtRecipe = MultitenancyRecipe.getInstanceOrThrowError();
            const tenantConfig = await mtRecipe.recipeInterfaceImpl.getTenant({ tenantId, userContext });
            if (tenantConfig === undefined) {
                throw new Error("Tenant not found");
            }
            const mergedProviders = mergeProvidersFromCoreAndStatic(tenantConfig.thirdParty.providers, providers, tenantId === DEFAULT_TENANT_ID);
            const provider = await findAndCreateProviderInstance(mergedProviders, thirdPartyId, clientType, userContext);
            return provider;
        },
    };
}
