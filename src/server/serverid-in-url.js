const applicationServer = require('../application-server.js')
const dashboard = require('@userappstore/dashboard')

module.exports = {
  after: async (req, res) => {
    if (!req.session) {
      return
    }
    // This detects the application owner, or an owner-organization  
    // member, accessing the administration interface to manage their
    // users, to do that they need a session created under the 
    // application server's configuration and req.account/req.session
    // repurposed before the UI or API process the request
    if (!req.urlPath.startsWith('/administrator/server_')) {
      return
    }
    const sessionWas = req.session
    const serverid = req.urlPath.split('/')[2]
    req.server = await applicationServer.get(`/api/dashboard-server/application-server?serverid=${serverid}`)
    if (!req.server) {
      return
    }
    let username
    if (req.server.ownerid === req.account.accountid || req.server.project.accountid === req.account.accountid) {
      username = `owner-${req.server.serverid}-${req.account.accountid}`
    } else {
      if (!req.server.organizationid) {
        throw new Error('invalid-account')
      }
      const query = req.query
      req.query = { organizationid: req.server.organizationid } 
      const membership = await global.api.user.organizations.OrganizationMembership.get(req)
      if (!membership) {
        throw new Error('invalid-account')
      }
      username = `administrator-${req.server.serverid}-${membership.membershipid}`
      req.query = query
    }
    req.urlPath = req.urlPath.split(`/${serverid}`).join(``)
    req.route = {}
    for (const field in global.sitemap[req.urlPath]) {
      req.route[field] = global.sitemap[req.urlPath][field]
    }
    req.route.html = req.route.html.split('navbar="/administrator/').join('navbar="/server-administrator/')
    req.appid = serverid
    if (req.server.stripeid) {
      req.stripeKey = {
        api_key: req.stripeKey.api_key,
        stripe_account: req.server.stripeid
      }
    }
    let sessionid = await dashboard.Storage.exists(`map/applicationSession/${sessionWas.sessionid}/${serverid}`)
    let session
    let bodyWas = req.body
    if (!sessionid) {
      req.body = {
        username,
        password: 'password'
      }
      try {
        session = await global.api.user.CreateSession._post(req)
        req.body = bodyWas
        delete (req.success)
      } catch (error) {
      }
      if (!session) {
        res.statusCode = 302
        if (req.server.ownerid === req.account.accountid || req.server.project.accountid === req.account.accountid) {
          res.setHeader('location', `/application-server-owner-setup?serverid=${serverid}`)
        } else {
          res.setHeader('location', `/application-server-administrator-setup?serverid=${serverid}`)
        }
        res.ended = true
        return res.end()
      }
      await dashboard.StorageObject.setProperty(`${req.appid}/${session.sessionid}`, 'expires', sessionWas.expires)
      await dashboard.Storage.write(`map/session/applicationServer/${sessionWas.sessionid}`, serverid, session.sessionid)
      sessionid = session.sessionid
    }    
    const query = req.query
    if (session) {
      req.session = session
    } else {
      req.query = { sessionid }
      req.session = await global.api.administrator.Session._get(req)
    }
    // if the userappstore session is unlocked so is the
    // application server session
    if (sessionWas.unlocked) {
      await dashboard.StorageObject.setProperty(`${req.appid}/${session.sessionid}`, 'unlocked', sessionWas.unlocked)
      req.session.unlocked = sessionWas.unlocked
    } else if (req.session.unlocked) {
      await dashboard.StorageObject.removeProperties(`${req.appid}/${session.sessionid}`, [ 'lock', 'lockURL', 'lockData', 'unlocked' ])
      delete (req.session.unlocked)
    }
    req.query = req.query || {}
    req.query.accountid = req.session.accountid
    req.account = await global.api.administrator.Account._get(req)
    req.query = query
    req.administratorAccount = req.account
    req.administratorSession = req.session
    if (req.method === 'POST') {
      res.on('finish', async (blob) => {
        // check for session locks that need to bubble up to
        // the UserAppStore session
        if (!req.session.lock) {
          return
        }
        await dashboard.StorageObject.setProperties(`${req.appid}/${req.session.sessionid}`, 'unlocked', 1)
        await dashboard.StorageObject.setProperties(`${global.appid}/${sessionWas.sessionid}`, {
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
            if (url && url.startsWith('/administrator/')) {
              const newURL = url.replace('/administrator/', `/administrator/${req.server.serverid}/`)
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