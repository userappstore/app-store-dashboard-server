const applicationServer = require('../application-server.js')
const dashboard = require('@userappstore/dashboard')
const stripeCache = require('@userappstore/stripe-subscriptions/src/stripe-cache.js')

module.exports = {
  after: async (req) => {
    if (req.applicationServer || !req.account || !req.stripeKey || req.session.lock) {
      return
    }
    const installs = await applicationServer.get(`/api/user/userappstore/installs?accountid=${req.account.accountid}`, req.account.accountid, req.session.sessionid)
    const realAccount = req.account
    const queryWas = req.query
    req.query = {}
    if (installs && installs.length) {
      for (const install of installs) {
        if (!install.subscriptionid) {
          continue
        }
        req.stripeKey.stripe_account = install.stripeid
        const subscription = await stripeCache.retrieve(install.subscriptionid, 'subscriptions', req.stripeKey)
        if (!subscription.deleted) {
          continue
        }
        const uninstall = await applicationServer.delete(`/api/user/userappstore/delete-install?installid=${install.installid}`, null, realAccount.accountid, req.session.sessionid)
        await dashboard.StorageList.remove(`${global.appid}/account/allSubscriptions/${realAccount.accountid}`, install.subscriptionid)
        const creditids = await dashboard.StorageList.listAll(`${install.serverid}/account/credits/${install.accountidSignedIn}`)
        if (!creditids || !creditids.length) {
          continue
        }
        const existing = await dashboard.StorageList.list(`${global.appid}/account/allCredits/${realAccount.accountid}`, 0, creditids.length)
        for (const creditid of creditids) {
          if (existing && existing.contains(creditid)) {
            continue
          }
          await dashboard.StorageList.add(`${global.appid}/account/allCredits/${realAccount.accountid}`, creditid)
          await dashboard.Storage.write(`${global.appid}/credit/server/${creditid}`, {
            serverid: install.serverid,
            accountid: req.account.accountid,
            accountidSignedIn: install.accountidSignedIn,
            subscriptionid: subscription.id,
            installid: install.installid,
            uninstallid: uninstall.uninstallid
          })
        }
      }
    }
    const organizationInstalls = await applicationServer.get(`/api/user/userappstore/organization-installs?accountid=${realAccount.accountid}`, realAccount.accountid, req.session.sessionid)
    if (organizationInstalls && organizationInstalls.length) {
      for (const install of organizationInstalls) {
        if (!install.subscriptionid) {
          continue
        }
        req.stripeKey.stripe_account = install.stripeid
        const subscription = await stripeCache.retrieve(install.subscriptionid, 'subscriptions', req.stripeKey)
        if (!subscription.deleted) {
          continue
        }
        const uninstall = await applicationServer.delete(`/api/user/userappstore/delete-install?installid=${install.installid}`, null, realAccount.accountid, req.session.sessionid)
        await dashboard.StorageList.remove(`${global.appid}/account/allSubscriptions/${realAccount.accountid}`, install.subscriptionid)
        req.account = { accountid: install.accountidSignedIn }
        req.appid = install.serverid
        req.query.accountid = install.accountidSignedIn
        const credits = await global.api.administrator.subscriptions.Credits._get(req)
        if (credits && credits.length && credit[0].reason === 'cancellation' && credits[0].subscriptionid === subscription.id) {
          await dashboard.StorageList.add(`${global.appid}/account/allCredits/${realAccount.accountid}`, credits[0].creditid)
          await dashboard.Storage.write(`${global.appid}/credit/server/${credits[0].creditid}`, {
            serverid: install.serverid,
            accountid: req.account.accountid,
            accountidSignedIn: install.accountidSignedIn,
            subscriptionid: subscription.id,
            installid: install.installid,
            uninstallid: uninstall.uninstallid
          })
        }
      }
    }
    req.account = realAccount
    req.query = queryWas
    delete (req.server)
    delete (req.stripeKey.stripe_account)
  }
}
