const dashboard = require('@userappstore/dashboard')

module.exports = {
  after: async (req, res) => {
    // only allow the application server to dot his
    if (!req.applicationServer || !req.account || req.appid === global.appid) {
      return
    }
    if (req.urlPath !== `/api/user/subscriptions/create-card`) {
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
