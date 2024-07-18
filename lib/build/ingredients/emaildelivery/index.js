import OverrideableBuilder from "supertokens-js-override";
export default class EmailDelivery {
    constructor(config) {
        let builder = new OverrideableBuilder(config.service);
        if (config.override !== undefined) {
            builder = builder.override(config.override);
        }
        this.ingredientInterfaceImpl = builder.build();
    }
}
