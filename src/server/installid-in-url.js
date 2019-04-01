const applicationServer = require('../application-server.js')
const dashboard = require('@userappstore/dashboard')

module.exports = {
  // This detects requests made by a user within an
  // install or the account settings for it, to do that
  // they need a session created under the account for 
  // application server's configuration and req.account/req.session
  // repurposed before the request proceeds to the
  // UserAppStore backend to load the project or URL
  after: async (req, res) => {
    if (!req.urlPath.startsWith('/install/') && !req.urlPath.startsWith('/account/')) {
      return
    }
    if (!req.account) {
      return
    }
    const sessionWas = req.session
    const queryWas = req.query
    const bodyWas = req.body
    const installid = req.urlPath.split('/')[2]
    let install
    if (installid.indexOf('-') < installid.lastIndexOf('-')) {
      install = await applicationServer.get(`/api/user/userappstore/install?installid=${installid}`, req.account.accountid, req.session.sessionid)
    }
    if (!install) {
      return
    }
    let sessionid = await dashboard.Storage.read(`map/applicationSession/${sessionWas.sessionid}/${install.serverid}`)
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
      let session
      try {
        session = await global.api.user.CreateSession._post(req)
      } catch (error) {
      }
      if (!session) {
        res.statusCode = 302
        res.setHeader('location', `/setup-install-profile?installid=${install.installid}`)
        res.ended = true
        return res.end()
      }
      delete (req.success)
      await dashboard.StorageObject.setProperty(`${req.appid}/session/${session.sessionid}`, 'expires', sessionWas.expires)
      await dashboard.Storage.write(`map/session/applicationServer/${sessionWas.sessionid}/${install.serverid}`, session.sessionid)
      sessionid = session.sessionid
    }
    let session
    req.query = { sessionid }
    try {
      session = await global.api.administrator.Session._get(req)
    } catch (error) {
    }
    req.install = install
    if (req.urlPath.startsWith('/account/')) {
      req.urlPath = req.urlPath.split(`/${installid}`).join(``)
      req.route = {}
      for (const field in global.sitemap[req.urlPath]) {
        req.route[field] = global.sitemap[req.urlPath][field]
      }
      req.route.html = req.route.html.split('navbar="/account/').join('navbar="/server-account/')
    }
    // if the userappstore session is unlocked so is the application server session
    if (sessionWas.unlocked) {
      await dashboard.StorageObject.setProperty(`${req.appid}/session/${session.sessionid}`, 'unlocked', sessionWas.unlocked)
      session.unlocked = sessionWas.unlocked
    } else if (session.unlocked) {
      await dashboard.StorageObject.removeProperties(`${req.appid}/session/${session.sessionid}`, ['lock', 'lockURL', 'lockData', 'unlocked'])
      delete (session.unlocked)
    }
    if (req.urlPath.startsWith('/account/')) {
      req.query = req.query || {}
      req.query.accountid = req.session.accountid
      req.account = await global.api.administrator.Account._get(req)
      req.session = session
    } 
    req.query = queryWas
    req.body = bodyWas
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
        if (blob && blob.toString()) {
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
