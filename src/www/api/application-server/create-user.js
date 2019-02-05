const applicationServer = require('../../../application-server.js')
const dashboard = require('@userappstore/dashboard')

// When Dashboard creates accounts the first is the 
// owner.  This shortcut for the application server makes
// sure the account created for a user is not the owner.
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
    if (!req.server) {
      throw new Error('invalid-application-serverid')
    }
    req.appid = req.query.serverid
    req.body.username = `user-${req.query.serverid}-${req.query.accountid}`
    req.body.password = 'password'
    const account = await global.api.user.CreateAccount.post(req)
    if (account.owner) {
      await dashboard.StorageObject.removeProperties(`${req.appid}:${account.accountid}`, [ 'owner', 'administrator' ])
      await dashboard.StorageList.remove(`${req.appid}/administrator/accounts`)
      delete (account.owner)
      delete (account.administrator)
    }
    req.success = true
    return account
  }
}
