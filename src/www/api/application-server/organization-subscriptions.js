
const applicationServer = require('../../../application-server.js')
const dashboard = require('@userdashboard/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.applicationServer) {
      throw new Error('invalid-access')
    }
    if (!req.query || !req.query.organizationid) {
      throw new Error('invalid-organizationid')
    }
    const subscriptionids = await dashboard.StorageList.listAll(`${global.appid}/organization/allSubscriptions/${req.query.organizationid}`)
    if (!subscriptionids.length) {
      return null
    }
    const items = []
    for (const subscriptionid of subscriptionids) {
      let info = await dashboard.Storage.read(`${global.appid}/subscription/server/${subscriptionid}`)
      if (!info) {
        throw new Error('invalid-subscription')
      }
      info = JSON.parse(info)
      const install = await applicationServer.get(`/api/dashboard-server/install?installid=${info.installid}`, req.account.accountid, req.session.sessionid)
      const installerMembership = await global.api.user.organizations.OrganizationMembership._get(req)
      items.push(installerMembership.membershipid)
      if (!install.subscriptions || !install.subscriptions.length) {
        continue
      }
      for (const membershipid of install.subscriptions) {
        items.push(membershipid)
      }
    }
    return items
  }
}
