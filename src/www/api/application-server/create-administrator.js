// When Dashboard creates accounts the first is the owner and
// then any subsequent administrator becomes so by assigning
// the power.  This shortcut for the application server tags
// owner-organization members as an administrator of a server.
const applicationServer = require('../../../application-server.js')
const dashboard = require('@userappstore/dashboard')

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
    const server = await applicationServer.get(`/api/dashboard-server/application-server?serverid=${req.query.serverid}`)
    req.query.organizationid = server.organizationid
    let membership
    try {
        membership = await global.api.user.organizations.OrganizationMembership.get(req)
      } catch (error) {
    }
    if (!membership) {
      throw new Error('invalid-account')
    }
    req.server = server
    req.appid = req.server.serverid
    if (req.server.ownerid === req.account.accountid) {
      throw new Error('invalid-account')
    }
    if (req.server.projectid && req.server.project.accountid === req.account.accountid) {
      throw new Error('invalid-account')
    }
    if (!req.server.organizationid) {
      throw new Error('invalid-application-serverid')
    }
    req.body.username = `administrator-${req.server.serverid}-${membership.membershipid}`
    req.body.password = 'password'
    const account = await global.api.user.CreateAccount.post(req)
    if (account.owner) {
      await dashboard.StorageObject.removeProperty(`${req.appid}/account/${account.accountid}`, 'owner')
      delete (account.owner)
    }
    if (!account.administrator) {
      await dashboard.StorageObject.setProperty(`${req.appid}/account/${account.accountid}`, 'administrator', dashboard.Timestamp.now)
      await dashboard.StorageList.add(`${req.appid}/administrator/accounts`, account.accountid)
      account.administrator = dashboard.Timestamp.now
    }
    req.success = true
    return account
  }
}
