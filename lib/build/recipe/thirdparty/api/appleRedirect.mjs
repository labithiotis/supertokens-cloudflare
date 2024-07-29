async function appleRedirectHandler(apiImplementation, options, userContext) {
  if (apiImplementation.appleRedirectHandlerPOST === void 0) {
    return false;
  }
  let body = await options.req.getFormData();
  await apiImplementation.appleRedirectHandlerPOST({
    formPostInfoFromProvider: body,
    options,
    userContext
  });
  return true;
}
export {
  appleRedirectHandler as default
};
