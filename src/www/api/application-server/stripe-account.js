// the application server needs to be able to query all stripe accounts
// on behalf of people browsing the app store
module.exports = {
  get: async (req) => {
    if (!req.applicationServer) {
      throw new Error('invalid-access')
    }
    if (!req.query || !req.query.stripeid) {
      throw new Error('invalid-stripeid')
    }
    return global.api.administrator.connect.StripeAccount._get(req)
  }
}
