// @ts-nocheck
import type { TypeInputWithService, EmailDeliveryInterface } from "./types";
export default class EmailDelivery<T> {
    ingredientInterfaceImpl: EmailDeliveryInterface<T>;
    constructor(config: TypeInputWithService<T>);
}
