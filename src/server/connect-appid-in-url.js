const applicationServer = require('../application-server.js')

module.exports = {
  after: async (req) => {
    if (!req.account) {
      return
    }
    if (!req.urlPath.startsWith('/administrator/') &&
        !req.urlPath.startsWith('/account/') &&
        !req.urlPath.startsWith('/api/administrator/') &&
        !req.urlPath.startsWith('/api/user/')) {
      return
    }
    const urlParts = req.urlPath.split('/')
    let appid, destination
    if (req.urlPath.startsWith('/api/')) {
      if (urlParts.length < 5) {
        return
      }
      appid = urlParts[3]
      destination = urlParts[4]
    } else {
      if (urlParts.length < 4) {
        return
      }
      appid = urlParts[2]
      destination = urlParts[3]
    }
    if (destination !== 'subscriptions' && destination !== 'organizations') {
      return
    }
    if (appid.split('-').length !== 3) {
      return
    }
    const app = await applicationServer.get(`/api/user/userappstore/app?appid=${appid}`, req.account.accountid, req.session.sessionid)
    if (app.accountid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    urlParts.splice(urlParts.indexOf(appid), 1)
    const urlPath = urlParts.join('/')
    req.urlPath = urlPath
    req.administratorAccount = req.account
    req.administratorSession = req.session
    req.appid = app.appid
    req.stripeKey = {
      api_key: req.stripeKey.api_key,
      stripe_account: app.stripeid
    }
  }
}
