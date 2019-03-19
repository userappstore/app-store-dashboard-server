const updateProfile = require('@userappstore/dashboard/src/www/api/user/update-profile.js')
updateProfile.lock = false

module.exports = {
  patch: async (req) => {
    if (!req.applicationServer) {
      throw new Error('invalid-access')
    }
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    if (req.query.accountid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    req.query.profileid = req.account.profileid
    return updateProfile.patch(req)
  }
}
