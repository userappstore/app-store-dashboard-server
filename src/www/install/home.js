const applicationServer = require('../../application-server.js')
const dashboard = require('@userappstore/dashboard')
const fs = require('fs')
const path = require('path')
const querystring = require('querystring')
let projectErrorHTML, proxyErrorHTML

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: renderPage,
  patch: renderPage,
  delete: renderPage,
  put: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.installid) {
    throw new Error('invalid-installid')
  }
  const install = await applicationServer.get(`/api/user/userappstore/install?installid=${req.query.installid}`, req.account.accountid, req.session.sessionid)
  if (!install) {
    throw new Error('invalid-installid')
  }
  let server
  if (install.serverid) {
    server = await applicationServer.get(`/api/user/userappstore/application-server?serverid=${install.serverid}`, req.account.accountid, req.session.sessionid)
  }
  req.data = { install, server }
  if (install.projectid) {
    const project = await applicationServer.get(`/api/user/userappstore/installed-project?projectid=${install.projectid}`, req.account.accountid, req.session.sessionid)
    if (!project) {
      throw new Error('invalid-project')
    }
    const files = await applicationServer.get(`/api/user/userappstore/installed-project-files?projectid=${install.projectid}`, req.account.accountid, req.session.sessionid)
    req.data.files = files
    req.data.project = project
  } else if (install.appid) {
    req.query.appid = install.appid
    const installedApp = await applicationServer.get(`/api/user/userappstore/installed-app?appid=${install.appid}`, req.account.accountid, req.session.sessionid)
    req.data.installedApp = installedApp
    if (installedApp.projectid) {
      const project = await applicationServer.get(`/api/user/userappstore/installed-project?projectid=${installedApp.projectid}`, req.account.accountid, req.session.sessionid)
      if (!project) {
        throw new Error('invalid-project')
      }
      const files = await applicationServer.get(`/api/user/userappstore/installed-project-files?projectid=${installedApp.projectid}`, req.account.accountid, req.session.sessionid)
      req.data.files = files
      req.data.project = project
    }
  } else if (install.url) {
    req.data.url = install.url
  }
}

async function renderPage (req, res) {
  let doc
  // rendering a project requires substituting root links
  // for their install-specific URLs
  if (req.data.project) {
    let projectHTML = req.data.files['home.html'] || `<html><head><title>${req.data.project.projectid}</title></head><body></body></html>`
    try {
      doc = dashboard.HTML.parse(projectHTML)
    } catch (error) {
      projectHTML = projectErrorHTML = projectErrorHTML || fs.readFileSync(path.join(__dirname, 'project-error.html')).toString('utf-8')
      doc = dashboard.HTML.parse(projectHTML)
    }
  } else if (req.data.install.serverid) {
    // proxy the application server and substitute root links
    // for their install-specific URLs
    let proxiedData
    let proxyURL = req.urlPath.substring(`/install`.length)
    delete (req.query.installid)
    proxyURL += '?' + querystring.stringify(req.query)
    if (req.method === 'GET') {
      proxiedData = await applicationServer.get(proxyURL, req.session.accountid, req.session.sessionid, req.data.server.applicationServer, req.data.server.applicationServerToken)
    } else {
      const method = req.method.toLowerCase()
      proxiedData = await applicationServer[method](proxyURL, req.body, req.session.accountid, req.session.sessionid, req.data.server.applicationServer, req.data.server.applicationServerToken)
    }
    // json response
    if (proxiedData) {
      if (Object.keys(proxiedData).length && (!proxiedData.body || !proxiedData.headers)) {
        res.setHeader('content-type', 'application/json')
        return res.end(JSON.stringify(proxiedData))
      }
      // non-html response
      if (proxiedData.headers['content-type'] && !proxiedData.headers['content-type'].startsWith('text/html')) {
        for (const header of ['content-type', 'content-encoding', 'content-length', 'date', 'etag', 'expires', 'vary']) {
          if (proxiedData.headers[header]) {
            res.setHeader(header, proxiedData.headers[header])
          }
        }
        if (proxiedData.headers['content-type'].startsWith('text/')) {
          return res.end(proxiedData.body.toString('utf-8'))
        } 
        return res.end(proxiedData.body)
      }
      try {
        const html = proxiedData.body.toString('utf-8')
        if (html.indexOf('<html') === -1) {
          for (const header of ['content-type', 'content-encoding', 'content-length', 'date', 'etag', 'expires', 'vary']) {
            if (proxiedData.headers[header]) {
              res.setHeader(header, proxiedData.headers[header])
            }
          }
          return res.end(html)
        }
        doc = dashboard.HTML.parse(proxiedData.body.toString('utf-8'))
      } catch (error) {
      }
      if (!doc) {
        proxyErrorHTML = proxyErrorHTML || fs.readFileSync(path.join(__dirname, 'proxy-error.html')).toString('utf-8')
        doc = dashboard.HTML.parse(proxyErrorHTML)
      }
    }
  }
  if (!req.data.install.serverid && req.data.url) {
    doc = dashboard.HTML.parse(req.route.html, req.data.install, 'install')
    res.setHeader('content-type', 'text/html')
    return dashboard.Response.end(req, res, doc)
  }
  if (!doc) {
    throw new Error('invalid-install')
  }
  // when you run dashboard yourself the application server
  // can specify content to add to the template via the
  // <template id="navbar"></template> and
  // <template id="head"></template> tags but this is
  // disabled on UserAppStore 
  let navbar = doc.getElementById('navbar')
  while (navbar) {
    navbar.parentNode.removeChild(navbar)
    navbar = doc.getElementById('navbar')
  }
  let head = doc.getElementById('head')
  if (head) {
    head.parentNode.removeChild(head)
    head = doc.getElementById('head')
  }
  res.setHeader('content-type', 'text/html')
  return dashboard.Response.end(req, res, doc)
}
