// @ts-nocheck
import type { TypeEmailPasswordEmailDeliveryInput } from "../../../../types";
import type { Transporter } from "nodemailer";
import type { ServiceInterface } from "../../../../../../ingredients/emaildelivery/services/smtp";
export declare function getServiceImplementation(transporter: Transporter, from: {
    name: string;
    email: string;
}): ServiceInterface<TypeEmailPasswordEmailDeliveryInput>;
