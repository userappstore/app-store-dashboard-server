const applicationServer = require('../../../application-server.js')
const dashboard = require('@userdashboard/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.applicationServer) {
      throw new Error('invalid-access')
    }
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    if (req.query.accountid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    const organizations = await global.api.user.organizations.Organizations.get(req)
    if (!organizations || !organizations.length) {
      return null
    }
    let subscriptionids = []
    for (const organization of organizations) {
      const ids = await dashboard.StorageList.listAll(`${global.appid}/organization/allSubscriptions/${organization.organizationid}`)
      if (ids && ids.length) {
        subscriptionids = subscriptionids.concat(ids)
      }
    }
    if (!subscriptionids.length) {
      return null
    }
    const membershipids = await dashboard.StorageList.listAll(`${global.appid}/account/memberships/${req.query.accountid}`)
    const items = []
    const realAccount = req.account
    for (const subscriptionid of subscriptionids) {
      req.account = realAccount
      let info = await dashboard.Storage.read(`${global.appid}/subscription/server/${subscriptionid}`)
      if (!info) {
        throw new Error('invalid-subscription')
      }
      info = JSON.parse(info)
      const install = await applicationServer.get(`/api/dashboard-server/install?installid=${info.installid}`, req.account.accountid, req.session.sessionid)
      if (!install.subscriptions || !install.subscriptions.length) {
        continue
      }
      for (const membershipid of install.subscriptions) {
        if (membershipids.indexOf(membershipid) > -1) {
          req.server = await applicationServer.get(`/api/dashboard-server/application-server?serverid=${info.serverid}`, req.account.accountid, req.session.sessionid)
          req.account = { accountid: info.accountid }
          req.appid = info.serverid
          req.query.subscriptionid = subscriptionid
          const subscription = await global.api.administrator.subscriptions.Subscription._get(req)
          items.push(subscription)
          break
        }
      }
    }
    req.appid = global.appid
    req.account = realAccount
    delete (req.server)
    return items
  }
}
