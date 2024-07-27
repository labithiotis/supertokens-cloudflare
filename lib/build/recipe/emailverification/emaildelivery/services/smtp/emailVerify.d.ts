// @ts-nocheck
import type { TypeEmailVerificationEmailDeliveryInput } from "../../../types";
import type { GetContentResult } from "../../../../../ingredients/emaildelivery/services/smtp";
export default function getEmailVerifyEmailContent(input: TypeEmailVerificationEmailDeliveryInput): GetContentResult;
export declare function getEmailVerifyEmailHTML(appName: string, email: string, verificationLink: string): string;
