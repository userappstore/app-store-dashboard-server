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
    let creditids
    if (req.query.all) {
      creditids = await dashboard.StorageList.listAll(`${global.appid}/account/allCredits/${req.query.accountid}`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      creditids = await dashboard.StorageList.list(`${global.appid}/account/allCredits/${req.query.accountid}`, offset)
    }
    if (!creditids || !creditids.length) {
      return null
    }
    const items = []
    const servers = {}
    const realAccount = req.account
    for (const creditid of creditids) {
      let info = await dashboard.Storage.read(`${global.appid}/credit/server/${creditid}`)
      if (!info) {
        throw new Error('invalid-credit')
      }
      info = JSON.parse(info)
      req.server = servers[info.serverid] || await applicationServer.get(`/api/dashboard-server/application-server?serverid=${info.serverid}`, req.account.accountid, req.session.sessionid)
      servers[info.serverid] = servers[info.serverid] || req.server
      req.account = { accountid: info.accountidSignedIn }
      req.appid = info.serverid
      req.query.creditid = creditid
      const credit = await global.api.user.subscriptions.Credit._get(req)
      credit.info = info
      items.push(credit)
    }
    req.appid = global.appid
    req.account = realAccount
    delete (req.server)
    return items
  }
}
