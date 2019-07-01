const applicationServer = require('../application-server.js')
const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: async (req) => {
    if (!req.query || !req.query.accountid || !req.query.sessionid || !req.query.token) {
      return
    }
    if (!req.urlPath.startsWith('/api/')) {
      return
    }
    const urlParts = req.urlPath.split('/')
    if (urlParts.length < 4) {
      return
    }
    const installid = urlParts[3]
    if (req.urlPath.startsWith('/api/') && (installid === 'user' || installid === 'administrator')) {
      return
    }
    let data = await dashboard.Storage.read(`map/applicationSessionTokens/${req.query.token}`)
    data = JSON.parse(data)
    req.data = data
    const queryWas = req.query
    req.query = {}
    req.query.sessionid = data.sessionid
    req.session = await global.api.administrator.Session._get(req)
    req.query.accountid = req.session.accountid
    req.account = await global.api.administrator.Account._get(req)
    req.query = queryWas
    req.allowAPIRequest = true
  },
  // This detects requests made by a user within an
  // install or the account settings for it, to do that
  // they need a session created under the account for 
  // application server's configuration and req.account/req.session
  // repurposed before the request proceeds to the
  // UserAppStore backend to load the project or URL
  after: async (req, res) => {
    if (!req.urlPath.startsWith('/install/')
      && !req.urlPath.startsWith('/account/')
      && !req.urlPath.startsWith('/api/')) {
      return
    }
    if (req.route) {
      return
    }
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'content-type')
    res.setHeader('Access-Control-Request-Headers', 'x-requested-with, accept, content-type')
    if (req.method === 'OPTIONS') {
      res.setHeader('content-type', 'text/plain')
      res.statusCode = 200
      res.ended = true
      return res.end()
    }
    const urlParts = req.urlPath.split('/')
    if (urlParts.length < 4) {
      return
    }
    let installid = req.urlPath.startsWith('/api/') ? urlParts[3] : urlParts[2]
    if (req.urlPath.startsWith('/api/') && (installid === 'user' || installid === 'administrator')) {
      return
    }
    const install = await applicationServer.get(`/api/dashboard-server/install?installid=${installid}`, null, null)
    if (!req.account || req.url.startsWith(`/install/${installid}/public/`)) {
      req.query = req.query || {}
      req.query.installid = installid
      req.route = global.sitemap['/install/home']
      return
    }
    if (!req.account) {
      return
    }
    let sessionid
    const queryWas = req.query
    const bodyWas = req.body
    const sessionWas = req.session
    if (req.query && req.query.accountid && req.query.sessionid && req.query.token) {
      req.account = { accountid: req.data.accountid }
      req.session = { sessionid: req.data.sessionid }
      req.install = install
      req.server = await applicationServer.get(`/api/user/userappstore/application-server?serverid=${req.install.serverid}`, req.account.accountid, req.session.sessionid)
      req.account = { accountid: req.query.accountid }
      req.session = { sessionid: req.query.sessionid }
      req.appid = req.install.serverid
      const newURL = req.url = req.url.replace(`/${req.install.installid}/`, '/')
      req.urlPath = req.url.split('?')[0]
      req.route = global.sitemap[newURL]
      req.url = req.url.replace(`/${installid}/`, `/`)
      req.urlPath = req.url.split('?')[0]
      req.route = global.sitemap[req.urlPath]
      req.query = queryWas
      return
    } else {
      if (!install) {
        return
      }
      if (install.url && !install.serverid) {
        req.query = queryWas
        req.query = req.query || {}
        req.query.installid = installid
        req.route = global.sitemap['/install/home']
        return
      }
      sessionid = await dashboard.Storage.read(`map/applicationSession/${sessionWas.sessionid}/${install.serverid}`)
      req.server = await applicationServer.get(`/api/user/userappstore/application-server?serverid=${install.serverid}`, req.account.accountid, req.session.sessionid)
      req.appid = install.serverid
      if (req.server.stripeid) {
        req.stripeKey = {
          api_key: req.stripeKey.api_key,
          stripe_account: req.server.stripeid
        }
      }
      if (!sessionid) {
        req.body = {
          username: `user-${install.serverid}-${req.account.accountid}`,
          password: 'password'
        }
        let newSession
        try {
          newSession = await global.api.user.CreateSession._post(req)
        } catch (error) {
        }
        if (!newSession) {
          res.statusCode = 302
          res.setHeader('location', `/setup-install-profile?installid=${install.installid}`)
          res.ended = true
          return res.end()
        }
        delete (req.success)
        await dashboard.StorageObject.setProperty(`${req.appid}/session/${newSession.sessionid}`, 'expires', sessionWas.expires)
        await dashboard.StorageObject.setProperty(`${req.appid}/session/${newSession.sessionid}`, 'token', newSession.token)
        await dashboard.Storage.write(`map/applicationSessionTokens/${newSession.token}`, {
          sessionid: sessionWas.sessionid,
          accountid: sessionWas.accountid,
          serverid: install.serverid,
          installid: install.installid
        })
        await dashboard.Storage.write(`map/applicationSession/${sessionWas.sessionid}/${install.serverid}`, newSession.sessionid)
        sessionid = newSession.sessionid
      }
    }
    req.query = { sessionid }
    let session = await global.api.administrator.Session._get(req)
    req.install = install
    if (req.urlPath.startsWith('/account/')) {
      req.urlPath = req.urlPath.split(`/${installid}`).join(``)
      req.route = {}
      const newRoute = global.sitemap[req.urlPath]
      if (newRoute) {
        for (const field in newRoute) {
          req.route[field] = newRoute[field]
        }
        if (req.route.html) {
          req.route.html = req.route.html.split('navbar="/account/').join('navbar="/server-account/')
        }
      }
    }
    // if the userappstore session is unlocked so is the application server session
    if (sessionWas.unlocked) {
      await dashboard.StorageObject.setProperty(`${req.appid}/session/${session.sessionid}`, 'unlocked', sessionWas.unlocked)
      session.unlocked = sessionWas.unlocked
    } else if (session.unlocked) {
      await dashboard.StorageObject.removeProperties(`${req.appid}/session/${session.sessionid}`, ['lock', 'lockURL', 'lockData', 'unlocked'])
      delete (session.unlocked)
    }
    req.session = session
    if (req.urlPath.startsWith('/account/')) {
      req.query = req.query || {}
      req.query.accountid = req.session.accountid
      req.account = await global.api.administrator.Account._get(req)
    }
    req.query = queryWas
    req.body = bodyWas
    const parts = req.urlPath.split('/')
    parts.splice(0, 3)
    const newPath = `/install/${parts.join('/')}`
    if (global.sitemap[newPath]) {
      req.urlPath = newPath
      req.urlWas = req.url
      req.url = `${req.urlPath}?installid=${installid}`
      req.query = req.query || {}
      req.query.installid = installid
      req.route = global.sitemap['/install/home']
      if (req.method === 'POST') {
        res.on('finish', async () => {
          // check for session locks that need to bubble up to
          // the UserAppStore session
          if (!req.session.lock) {
            return
          }
          await dashboard.StorageObject.setProperties(`${req.appid}/session/${req.session.sessionid}`, 'unlocked', 1)
          await dashboard.StorageObject.setProperties(`${global.appid}/session/${sessionWas.sessionid}`, {
            lock: req.session.lock,
            lockURL: req.session.lockURL,
            lockData: req.session.lockData
          })
        })
      }
      if (req.method === 'GET' || req.method === 'POST') {
        res.endWas = res.end
        res.end = (blob) => {
          // check for redirects that need to be tagged with serverids
          if (blob && blob.toString) {
            let str = blob.toString('utf-8')
            if (str.indexOf('<meta http-equiv="refresh" content="1;url=') > -1) {
              let url = str.split('<meta http-equiv="refresh" content="1;url=')[1]
              url = url.substring(0, url.indexOf('"'))
              if (url && url.startsWith('/install/')) {
                const newURL = url.replace('/install/', `/install/${install.installid}/`)
                str = str.split(url).join(newURL)
                const buffer = Buffer.from(str)
                return res.endWas(buffer)
              }
            }
          }
          return res.endWas(blob)
        }
      }
    }
  }
}
