module.exports = {
  after: renderOpenedInstall
}

async function renderOpenedInstall(req, res) {
  if (!req.query || !req.query.installid) {
    throw new Error('invalid-installid')
  }
  const install = await global.api.user.userappstore.Install.get(req)
  if (!install) {
    throw new Error('invalid-installid')
  }
  if (!install.url || install.application-server !== 'iframe') {
    throw new Error('invalid-install')
  }
  const doc = dashboard.HTML.parse(req.route.html, req.data.install, 'install')
  return dashboard.Response.end(req, res, doc)
}
