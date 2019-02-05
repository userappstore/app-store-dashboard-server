// This is largely a copy/paste it just doesn't
// lock the session to authorize creating for
// the application server to create cards
const applicationServer = require('../../../application-server.js')
const dashboard = require('@userappstore/dashboard')
const stripeWithKey = require('stripe')(process.env.STRIPE_KEY)
const stripe = require('stripe')()

module.exports = {
  post: async (req) => {
    if (!req.applicationServer) {
      throw new Error('invalid-access')
    }
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    if (!req.body || !req.body.installid || !req.body.installid.length) {
      throw new Error('invalid-installid')
    }
    if (!req.body.accountid || !req.body.accountid.length) {
      throw new Error('invalid-accountid')
    }
    const install = await applicationServer.get(`/api/user/userappstore/install?installid=${req.body.installid}`, req.account.accountid, req.session.sessionid)
    const app = await applicationServer.get(`/api/user/userappstore/published-app?appid=${install.appid}`, req.account.accountid, req.session.sessionid)
    const token = await stripeWithKey.tokens.create({ customer: req.query.customerid }, { stripe_account: app.stripeid })
    req.stripeKey.stripe_account = app.stripeid
    const customerInfo = {
      description: 'customer',
      source: token.id,
      metadata: {
        appid: app.serverid,
        accountid: req.body.accountid
      }
    }
    let connectCustomer
    try {
      connectCustomer = await stripe.customers.create(customerInfo, req.stripeKey)
    } catch (error) {
      throw error
    }
    try { 
      await dashboard.StorageList.add(`${app.serverid}/customers`, connectCustomer.id)
    } catch (error) {
      throw error
    }
    await dashboard.StorageList.add(`${app.serverid}/account/customers/${req.body.accountid}`, connectCustomer.id)
    await dashboard.StorageObject.setProperty(`${app.serverid}/map/accountid/customerid`, connectCustomer.id, req.body.accountid)
    req.success = true
    return connectCustomer
  }
}
