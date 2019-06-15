const applicationServer = require('../../../application-server.js')

module.exports = {
  get: async (req) => {
    if (!req.applicationServer) {
      throw new Error('invalid-access')
    }
    if (!req.query || !req.query.installid) {
      throw new Error('invalid-installid')
    }
    const install = await applicationServer.get(`/api/dashboard-server/install?installid=${req.query.installid}`, req.account.accountid, req.session.sessionid)
    req.server = await applicationServer.get(`/api/dashboard-server/application-server?serverid=${install.serverid}`, req.account.accountid, req.session.sessionid)
    req.account = { accountid: install.accountidSignedIn }
    req.appid = install.serverid
    req.stripeKey.stripe_account = req.server.stripeid
    req.query.subscriptionid = install.subscriptionid
    try { 
      return global.api.user.subscriptions.UpcomingInvoice._get(req)
    } catch (error) {
    }
  }
}
