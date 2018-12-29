const applicationServer = require('../application-server.js')

module.exports = {
  after: async (req) => {
    if (!req.account) {
      return
    }
    if (!req.urlPath.startsWith('/account/') &&
      !req.urlPath.startsWith('/install/') &&
      !req.urlPath.startsWith('/api/user/')) {
      return
    }
    const urlParts = req.urlPath.split('/')
    let installid, destination
    if (req.urlPath.startsWith('/api/')) {
      if (urlParts.length < 5) {
        return
      }
      installid = urlParts[3]
      destination = urlParts[4]
    } else {
      if (urlParts.length < 4) {
        return
      }
      installid = urlParts[2]
      if (req.urlPath.startsWith('/install/')) {
        destination = urlParts[1]
      } else {
        destination = urlParts[3]
      }
    }
    console.log(installid, destination)
    if (destination !== 'install' && destination !== 'subscriptions' && destination !== 'organizations') {
      return
    }
    const install = await applicationServer.get(`/api/user/userappstore/install?installid=${installid}`, req.account.accountid, req.session.sessionid)
    if (!install || install.accountid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    urlParts.splice(urlParts.indexOf(installid), 1)
    const urlPath = urlParts.join('/')
    req.urlPath = urlPath
    req.appid = installid
    if (install.stripeid) {
      req.stripeKey = {
        api_key: req.stripeKey.api_key,
        stripe_account: install.stripeid
      }
    }
  }
}
