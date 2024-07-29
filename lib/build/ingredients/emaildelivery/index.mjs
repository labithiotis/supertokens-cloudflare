import OverrideableBuilder from "supertokens-js-override";
class EmailDelivery {
  constructor(config) {
    let builder = new OverrideableBuilder(config.service);
    if (config.override !== void 0) {
      builder = builder.override(config.override);
    }
    this.ingredientInterfaceImpl = builder.build();
  }
}
export {
  EmailDelivery as default
};
