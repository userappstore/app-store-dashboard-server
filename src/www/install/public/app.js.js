const dashboard = require('@userappstore/dashboard')
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
      const server = await applicationServer.get(`/api/user/userappstore/application-server?serverid=${install.serverid}`, req.account.accountid, req.session.sessionid)
      const js = await applicationServer.get('/public/app.js', null, null, server.applicationServer, server.applicationServerToken)
      req.data = {
        files: {
          'app.js': js || ''
        }
      }
    } catch (error) {
    }
  }
}

async function renderPage(req, res) {
  if (!req.data) {
    res.statusCode = 404
    return res.end()
  }
  res.setHeader('content-type', 'text/javascript')
  return res.end(req.data.files['app.js'] || '')
}
