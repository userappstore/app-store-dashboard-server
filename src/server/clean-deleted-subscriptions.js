const applicationServer = require('../application-server.js')
const dashboard = require('@userappstore/dashboard')

module.exports = {
  after: async (req) => {
    if (req.applicationServer || !req.account) {
      return
    }
    if (req.session.lock) {
      return
    }
    const installs = await applicationServer.get(`/api/user/userappstore/installs?accountid=${req.account.accountid}`, req.account.accountid, req.session.sessionid)
    if (installs && installs.length) {
      for (const install of installs) {
        if (!install.subscriptionid) {
          continue
        }
        const exists = await dashboard.StorageList.exists(`${install.serverid}/subscriptions`, install.subscriptionid)
        if (!exists) {
          const uninstall = await applicationServer.delete(`/api/user/userappstore/delete-install?installid=${install.installid}`, null, req.account.accountid, req.session.sessionid)
          await dashboard.StorageList.remove(`${global.appid}/account/allSubscriptions/${req.account.accountid}`, install.subscriptionid)
        }
      }
    }
    const queryWas = req.query
    req.query = { accountid: req.account.accountid }
    const organizationInstalls = await applicationServer.get(`/api/user/userappstore/organization-installs?accountid=${req.account.accountid}`, req.account.accountid, req.session.sessionid)
    req.query = queryWas
    if (organizationInstalls && organizationInstalls.length) {
      for (const install of organizationInstalls) {
        if (!install.subscriptionid) {
          continue
        }
        const exists = await dashboard.StorageList.exists(`${install.serverid}/subscriptions`, install.subscriptionid)
        if (!exists) {
          const uninstall = await applicationServer.delete(`/api/user/userappstore/delete-install?installid=${install.installid}`, null, req.account.accountid, req.session.sessionid)
        }
      }
    }
  }
}
