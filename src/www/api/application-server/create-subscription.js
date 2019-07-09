const applicationServer = require('../../../application-server.js')
const dashboard = require('@userdashboard/dashboard')
const stripe = require('stripe')()
const stripeCache = require('@userappstore/stripe-subscriptions/src/stripe-cache.js')
const createSubscription = require('@userappstore/stripe-subscriptions/src/www/api/user/subscriptions/create-subscription.js')

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
    req.body.planid = install.planid
    if (install.subscriptions && install.subscriptions.length > 1) {
      req.body.quantity = install.subscriptions.length
    }
    let membership
    if (install.organizationid) {
      req.query.organizationid = install.organizationid
      membership = await global.api.user.organizations.OrganizationMembership._get(req)
    }
    const realAccount = req.account
    req.account = { accountid: req.body.accountid }
    req.stripeKey.stripe_account = server.stripeid
    req.server = server
    req.appid = server.serverid
    const subscription = await createSubscription.post(req)
    // index for the subscription creator to view in aggregate
    await dashboard.StorageList.add(`${global.appid}/account/allSubscriptions/${realAccount.accountid}`, subscription.id)
    await dashboard.Storage.write(`${global.appid}/subscription/server/${subscription.id}`, {
      serverid: server.serverid, 
      accountid: req.account.accountid, 
      subscriptionid: subscription.id, 
      installid: install.installid 
    })
    // index for any included subscribers
    if (install.organizationid) {
      await dashboard.StorageList.add(`${global.appid}/organization/allSubscriptions/${install.organizationid}`, subscription.id)
    }
    // update the subscription with relevant information
    const updateInfo = {
      metadata: {
        installid: install.installid
      },
      application_fee: app.applicationFee
    }
    if (install.organizationid) {
      updateInfo.metadata.organizationid = install.organizationid
      updateInfo.metadata.membershipid = membership.membershipid
    }
    const subscriptionNow = await stripe.subscriptions.update(subscription.id, updateInfo, req.stripeKey)
    await stripeCache.update(subscriptionNow, req.stripeKey)
    req.success = true
    return subscriptionNow
  }
}
