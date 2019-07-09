// When Dashboard creates accounts the first is the owner and 
// then any subsequent owner becomes so by transferring the
// ownership.  This shortcut for the application server tags
// any account as the owner.
const applicationServer = require('../../../application-server.js')
const dashboard = require('@userdashboard/dashboard')

module.exports = {
  post: async (req) => {
    if (!req.applicationServer) {
      throw new Error('invalid-access')
    }
    if (!req.query || !req.query.serverid) {
      throw new Error('invalid-application-serverid')
    }
    if (!req.body || !req.body.email || !req.body.email.length || !req.body.email.indexOf('@') > 0) {
      throw new Error('invalid-profile-email')
    }
    if (!req.body['first-name'] || !req.body['first-name'].length) {
      throw new Error('invalid-profile-first-name')
    }
    if (global.minimumProfileFirstNameLength > req.body['first-name'].length ||
      global.maximumProfileFirstNameLength < req.body['first-name'].length) {
      throw new Error('invalid-profile-first-name-length')
    }
    if (!req.body['last-name'] || !req.body['last-name'].length) {
      throw new Error('invalid-profile-last-name')
    }
    if (global.minimumProfileLastNameLength > req.body['last-name'].length ||
      global.maximumProfileLastNameLength < req.body['last-name'].length) {
      throw new Error('invalid-profile-last-name-length')
    }
    req.server = await applicationServer.get(`/api/dashboard-server/application-server?serverid=${req.query.serverid}`)
    req.appid = req.server.serverid
    if (req.server.ownerid !== req.account.accountid) {
      if (req.server.projectid && req.server.project.accountid !== req.account.accountid) {
        throw new Error('invalid-account')
      }
    }
    req.body.username = `owner-${req.server.serverid}-${req.account.accountid}`
    req.body.password = 'password'
    const account = await global.api.user.CreateAccount.post(req)
    if (!account.owner) {
      await dashboard.StorageObject.setProperties(`${req.appid}/${account.accountid}`, {
        'owner': dashboard.Timestamp.now,
        'administrator': dashboard.Timestamp.now
      })
      await dashboard.StorageList.add(`${req.appid}/administrator/accounts`, account.accountid)
    }
    req.success = true
    return account
  }
}
