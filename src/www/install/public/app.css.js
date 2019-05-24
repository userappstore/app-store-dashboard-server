const applicationServer = require('../../../application-server.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest(req) {
  if (!req.query || !req.query.installid) {
    throw new Error('invalid-installid')
  }
  const install = await applicationServer.get(`/api/user/userappstore/install?installid=${req.query.installid}`, req.account.accountid, req.session.sessionid)
  if (!install) {
    throw new Error('invalid-installid')
  }
  if (install.projectid) {
    const project = await applicationServer.get(`/api/user/userappstore/installed-project?projectid=${install.projectid}`, req.account.accountid, req.session.sessionid)
    if (!project) {
      throw new Error('invalid-project')
    }
    const files = await applicationServer.get(`/api/user/userappstore/installed-project-files?projectid=${install.projectid}`, req.account.accountid, req.session.sessionid)
    req.data = { files }
  } else {
    try {
      console.log('proxying css')
      const server = await applicationServer.get(`/api/user/userappstore/application-server?serverid=${install.serverid}`, req.account.accountid, req.session.sessionid)
      const css = await applicationServer.get('/public/app.css', null, null, server.applicationServer, server.applicationServerToken)
      console.log('got css', css)
      req.data = { 
        files: {
          'app.css': css || ''
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
}

async function renderPage(req, res) {
  if (!req.data) {
    res.statusCode = 404
    return res.end()
  }
  res.setHeader('content-type', 'text/css')
  return res.end(req.data.files['app.css'] || '')
}
