class BaseRequest {
  constructor() {
    // Note: While it's not recommended to override this method in child classes,
    // if necessary, implement a similar caching strategy to ensure that `getFormDataFromRequestBody` is called only once.
    this.getFormData = async () => {
      if (this.parsedUrlEncodedFormData === void 0) {
        this.parsedUrlEncodedFormData = await this.getFormDataFromRequestBody();
      }
      if (typeof FormData !== "undefined" && this.parsedUrlEncodedFormData instanceof FormData) {
        const ret = {};
        this.parsedUrlEncodedFormData.forEach((value, key) => ret[key] = value);
        return ret;
      }
      return this.parsedUrlEncodedFormData;
    };
    // Note: While it's not recommended to override this method in child classes,
    // if necessary, implement a similar caching strategy to ensure that `getJSONFromRequestBody` is called only once.
    this.getJSONBody = async () => {
      if (this.parsedJSONBody === void 0) {
        this.parsedJSONBody = await this.getJSONFromRequestBody();
      }
      return this.parsedJSONBody;
    };
    this.wrapperUsed = true;
    this.parsedJSONBody = void 0;
    this.parsedUrlEncodedFormData = void 0;
  }
}
export {
  BaseRequest
};
