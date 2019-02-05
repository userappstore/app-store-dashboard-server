

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.installid) {
    throw new Error('invalid-installid')
  }
  const install = await global.api.user.userappstore.Install.get(req)
  if (!install) {
    throw new Error('invalid-installid')
  }
  if (!install.url || install.application-server !== 'proxy') {
    throw new Error('invalid-install')
  }
  let app
  if (install.appid) {
    app = await global.api.user.userappstore.App.get(req)
    if (!app) {
      throw new Error('invalid-installid')
    }
  }
  req.data = { install, app }
}

async function renderPage(req, res) {
  let doc
  if (req.data.app) {
    if (req.method === 'GET') {
      await applicationServer.get(req.url, req.account.accountid, req.session.sessionid, req.data.app.applicationServerURL, req.data.app.applicationServerToken)
    } else {
      const method = applicationServer[req.method.toLowerCase()]
      await method(req.url, req.body, req.account.accountid, req.session.sessionid)
    }
  } else {
    // regular proxy
  }
  if (!doc) {
    throw new Error('invalid-install')
  }
  // On UserAppStore the navbar is used for switching between
  // installs so if project or URL returns a navbar it is
  // renamed, later the 'installs-navbar' content handler puts
  // 'app-navbar' into a secondary navigation in the
  // UserAppStore template.  If you run a standalone copy of
  // Dashboard it will use the navbar
  const installNavbar = doc.getElementById('navbar')
  if (installNavbar) {
    installNavbar.attr.id = 'app-navbar'
  }
  // The project's <template id="head" /> can't be used on
  // UserAppStore because it adds HTML to the <head> of the
  // template.  If you run a standalone copy of Dashboard
  // you can use it to embed fonts, JavaScript etc in the
  // template <head>.
  const installHead = doc.getElementById('head')
  if (installHead) {
    installNavbar.attr.id = 'app-head'
  }
  res.setHeader('content-type', 'text/html')
  return res.end(doc.toString())
}
