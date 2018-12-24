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
    const accountReq = { query: { stripeid: req.query.stripeid }, stripeKey: req.stripeKey, appid: req.appid }
    return global.api.administrator.connect.StripeAccount._get(accountReq)
  }
}
