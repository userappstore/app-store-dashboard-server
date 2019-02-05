// This is largely a copy/paste it just doesn't
// lock the session to authorize creating for
// the application server to create subscriptions
const applicationServer = require('../../../application-server.js')
const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()
const stripeCache = require('@userappstore/stripe-subscriptions/src/stripe-cache.js')

module.exports = {
  post: async (req) => {
    if (!req.applicationServer) {
      throw new Error('invalid-access')
    }
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    if (!req.body || !req.body.installid) {
      throw new Error('invalid-installid')
    }
    const install = await applicationServer.get(`/api/user/userappstore/install?installid=${req.body.installid}`, req.account.accountid, req.session.sessionid)
    const app = await applicationServer.get(`/api/user/userappstore/published-app?appid=${install.appid}`, req.account.accountid, req.session.sessionid)
    const server = await applicationServer.get(`/api/user/userappstore/application-server?serverid=${app.serverid}`, req.account.accountid, req.session.sessionid)
    req.account = { accountid: req.body.accountid }
    req.stripeKey.stripe_account = server.stripeid
    req.server = server
    req.appid = server.serverid
    const customer = await global.api.user.subscriptions.Customer._get(req)
    req.query.planid = install.planid
    const plan = await global.api.user.subscriptions.PublishedPlan._get(req)
    if (!plan) {
      throw new Error('invalid-planid')
    }
    if (plan.metadata.unpublished) {
      throw new Error('invalid-plan')
    }
    if (!customer.default_source && plan.amount) {
      throw new Error('invalid-cardid')
    }
    if (req.body.tax_percent) {
      try {
        const percent = parseInt(req.body.tax_percent, 10)
        if (percent < 1 || percent.toString() !== req.body.tax_percent) {
          throw new Error('invalid-tax_percent')
        }
      } catch (error) {
        throw new Error('invalid-tax_percent')
      }
    }
    const subscriptionInfo = {
      customer: req.query.customerid,
      items: [{
        plan: install.planid
      }],
      metadata: {
        appid: req.appid,
        accountid: req.account.accountid,
      },
      tax_percent: req.body.tax_percent || 0
    }
    if (install.subscriptions && install.subscriptions.length > 1) {
      subscriptionInfo.quantity = install.subscriptions.length
    }
    try {
      const subscription = await stripe.subscriptions.create(subscriptionInfo, req.stripeKey)
      await stripeCache.update(subscription, req.stripeKey)
      await dashboard.StorageList.add(`${req.appid}/subscriptions`, subscription.id)
      await dashboard.StorageList.add(`${req.appid}/account/subscriptions/${req.account.accountid}`, subscription.id)
      await dashboard.StorageList.add(`${req.appid}/customer/subscriptions/${req.query.customerid}`, subscription.id)
      await dashboard.StorageList.add(`${req.appid}/account/plan/subscriptions/${req.query.planid}/${req.account.accountid}`, subscription.id)
      await dashboard.StorageList.add(`${req.appid}/account/product/subscriptions/${plan.product}/${req.account.accountid}`, subscription.id)
      await dashboard.StorageList.add(`${req.appid}/account/plan/customers/${req.query.planid}/${req.account.accountid}`, req.query.customerid)
      await dashboard.StorageList.add(`${req.appid}/account/product/customers/${plan.product}/${req.account.accountid}`, req.query.customerid)
      await dashboard.StorageList.add(`${req.appid}/plan/subscriptions/${req.query.planid}`, subscription.id)
      await dashboard.StorageList.add(`${req.appid}/product/subscriptions/${plan.product}`, subscription.id)
      await dashboard.StorageList.add(`${req.appid}/plan/customers/${req.query.planid}`, req.query.customerid)
      await dashboard.StorageList.add(`${req.appid}/product/customers/${plan.product}`, req.query.customerid)
      req.success = true
      return subscription
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
