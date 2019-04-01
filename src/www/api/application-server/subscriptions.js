const applicationServer = require('../../../application-server.js')
const dashboard = require('@userappstore/dashboard')

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
    let subscriptionids
    if (req.query.all) {
      subscriptionids = await dashboard.StorageList.listAll(`${global.appid}/account/allSubscriptions/${req.query.accountid}`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      subscriptionids = await dashboard.StorageList.list(`${global.appid}/account/allSubscriptions/${req.query.accountid}`, offset)
    }
    if (!subscriptionids || !subscriptionids.length) {
      return null
    }
    const items = []
    const servers = {}
    const realAccount = req.account
    for (const subscriptionid of subscriptionids) {
      req.account = realAccount
      let info = await dashboard.Storage.read(`${global.appid}/subscription/server/${subscriptionid}`)
      if (!info) {
        throw new Error('invalid-subscription')
      }
      info = JSON.parse(info)
      req.server = servers[info.serverid] || await applicationServer.get(`/api/dashboard-server/application-server?serverid=${info.serverid}`, req.account.accountid, req.session.sessionid)
      req.account = { accountid: info.accountid }
      servers[info.serverid] = servers[info.serverid] || req.server
      req.appid = info.serverid
      req.query.subscriptionid = subscriptionid
      const subscription = await global.api.user.subscriptions.Subscription._get(req)
      items.push(subscription)
    }
    req.appid = global.appid
    req.account = realAccount
    delete (req.server)
    return items
  }
}
