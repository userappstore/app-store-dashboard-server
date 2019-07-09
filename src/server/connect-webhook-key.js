const applicationServer = require('../application-server.js')
const stripeCache = require('@userdashboard/stripe-subscriptions/src/stripe-cache.js')

module.exports = {
  after: async (req) => {
    if (req.urlPath !== '/webhooks/subscriptions/index-stripe-data') {
      return
    }
    if (!req.bodyRaw || !req.stripeKey) {
      return
    }
    const json = JSON.parse(req.bodyRaw)
    let serverid
    if (json.data && json.data.object && json.data.object.receipt_url && req.bodyRaw.indexOf(`/acct_`) > -1) {
      req.stripeKey.stripe_account = json.data.object.receipt_url.split('/')[4]
      try {
        const customer = await stripeCache.retrieve(json.data.object.customer, 'customers', req.stripeKey)
        serverid = customer.metadata.appid
      } catch (error) {
      }
    } else if (req.bodyRaw.indexOf('appid') > -1) {
      serverid = req.bodyRaw.substring(req.bodyRaw.indexOf('"appid": "') + '"appid": "'.length)
      serverid = serverid.substring(0, serverid.indexOf('"'))
    }
    if (!serverid || serverid === global.appid) {
      req.endpointSecret = process.env.SUBSCRIPTIONS_ENDPOINT_SECRET1
      return
    }
    req.server = await applicationServer.get(`/api/dashboard-server/application-server?serverid=${serverid}`)
    req.appid = serverid
    req.stripeKey.stripe_account = req.server.stripeid
    req.endpointSecret = process.env.SUBSCRIPTIONS_ENDPOINT_SECRET2
  }
}
