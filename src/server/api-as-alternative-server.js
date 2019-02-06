const applicationServer = require('../application-server.js')

// This reconfigures API requests made by the application server
// using a user's application server and superimposes the new
// configuration on the request
module.exports = {
  before: async (req) => { 
    if (!req.headers['x-application-server'] || req.headers['x-application-server'] === global.applicationServer) {
      return
    }
    const serverType = req.headers['x-application-server'].startsWith('https') ? 'url' : 'project'
    const serverTypeDesc = serverType === 'url' ? 'url' : 'projectid'
    req.server = await applicationServer.get(`/api/dashboard-server/${serverType}-application-server?${serverTypeDesc}=${req.headers['x-application-server']}`)
    if (req.server) {
      req.appid = req.server.serverid
      if (req.server.stripeid) {
        req.stripeKey = {
          api_key: process.env.STRIPE_KEY,
          stripe_account: req.server.stripeid
        }
      }
    }
  }
}

