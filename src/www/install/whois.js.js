module.exports = {
  get: async (req, res) => {
    req.query = req.query | {}
    req.query.accountid = req.session.accountid
    const user = {}
    user.sessionid = req.session.sessionid
    user.accountid = req.session.accountid
    user.installid = req.install.installid
    user.dashboard = global.dashboardServer
    user.token = req.session.token
    if (req.install.organizationid) {
      user.organizationid = req.install.organizationid
    }
    res.setHeader('content-type', 'text/javascript')
    return res.end('window.user = ' + JSON.stringify(user))
  }
}