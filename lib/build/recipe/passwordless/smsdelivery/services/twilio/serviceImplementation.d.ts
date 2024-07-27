// @ts-nocheck
import type { TypePasswordlessSmsDeliveryInput } from "../../../types";
import Twilio from "twilio/lib/rest/Twilio";
import type { ServiceInterface } from "../../../../../ingredients/smsdelivery/services/twilio";
export declare function getServiceImplementation(twilioClient: Twilio): ServiceInterface<TypePasswordlessSmsDeliveryInput>;
