const applicationServer = require('../application-server.js')
const dashboard = require('@userappstore/dashboard')

module.exports = {
  // This detects requests made by a user within an
  // install or the account settings for it, to do that
  // they need a session created under the account for 
  // application server's configuration and req.account/req.session
  // repurposed before the request proceeds to the
  // UserAppStore backend to load the project or URL
  after: async (req,) => {
    if (!req.urlPath.startsWith('/install/')) {
      return
    }
    const sessionWas = req.session
    const installid = req.urlPath.split('/')[2]
    req.install = await applicationServer.get(`/api/user/userappstore/install?installid=${installid}`)
    if (!req.install) {
      return
    }
    let sessionid = await dashboard.Storage.exists(`map/applicationSession/${sessionWas.sessionid}/${serverid}`)
    let bodyWas = req.body
    if (!sessionid) {
      req.body = {
        username: `user-${install.serverid}-${req.account.accountid}`,
        password: 'password'
      }
      const session = await global.api.user.CreateSession._post(req)
      req.body = bodyWas
      delete (req.success)
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
      await dashboard.StorageObject.removeProperties(`${req.appid}/${session.sessionid}`, ['lock', 'lockURL', 'lockData', 'unlocked'])
      delete (req.session.unlocked)
    }
    req.query = req.query || {}
    req.query.accountid = req.session.accountid
    req.account = await global.api.administrator.Account._get(req)
    req.query = query
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
            if (url && url.startsWith('/install/')) {
              const newURL = url.replace('/install/', `/install/${req.install.installid}/`)
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
