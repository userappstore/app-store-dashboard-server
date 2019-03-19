const createProfile = require('@userappstore/dashboard/src/www/api/user/create-profile.js')
createProfile.lock = false

module.exports = {
  post: async (req) => {
    if (!req.applicationServer) {
      throw new Error('invalid-access')
    }
    return createProfile.post(req)
  }
}
