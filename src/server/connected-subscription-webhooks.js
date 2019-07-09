const applicationServer = require('../application-server.js')
const dashboard = require('@userdashboard/dashboard')

module.exports = {
  // This detects webhooks from Stripe that are sent to the subscriptions
  // module but need to have the Connect account credentials and application
  // server configured on the request
  after: async (req, res) => {
    if (!req.bodyRaw || req.urlPath !== '/webhooks/subscriptions/index-stripe-data') {
      return
    }
    const si = req.bodyRaw.indexOf('server_')
    if (si === -1) {
      return
    }
    let serverid = req.bodyRaw.substring(si)
    serverid = serverid.substring(0, serverid.indexOf('"'))
    try { 
      req.server = await applicationServer.get(`/api/dashboard-server/application-server?serverid=${serverid}`)
    } catch (error) {
    }
    if (!req.server) {
      res.statusCode = 200
      res.ended = true
      return res.end()
    }
    req.appid = serverid
    req.stripeKey = {
      api_key: req.stripeKey.api_key,
      stripe_account: req.server.stripeid
    }
  }
}