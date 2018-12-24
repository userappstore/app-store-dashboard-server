const dashboard = require('@userappstore/dashboard')
const defaultAppID = global.appid || 'app'

module.exports = {
  after: async (req, res) => {
    if (!req.applicationServer || !req.account || req.appid === defaultAppID) {
      return
    }
    if (req.urlPath !== `/api/user/subscriptions/create-subscription`) {
      return
    }
    if (req.session.unlocked) {
      return
    }
    await dashboard.RedisObject.setProperties(req.session.sessionid, { 'lockURL': req.url, 'unlocked': 1 })
    req.session.lockURL = req.url
    req.session.unlocked = 1
  }
}
