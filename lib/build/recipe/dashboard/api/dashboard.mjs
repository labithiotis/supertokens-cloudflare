async function dashboard(apiImplementation, options, userContext) {
  if (apiImplementation.dashboardGET === void 0) {
    return false;
  }
  const htmlString = await apiImplementation.dashboardGET({
    options,
    userContext
  });
  options.res.sendHTMLResponse(htmlString);
  return true;
}
export {
  dashboard as default
};
