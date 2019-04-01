const applicationServer = require('../application-server.js')

module.exports = {
  // This detects requests made by a user within an
  // project preview and superimposes the project 
  // information on the request
  after: async (req) => {
    if (!req.account) {
      return
    }
    if (!req.urlPath.startsWith('/project/')) {
      return
    }
    const urlParts = req.urlPath.split('/')
    let projectid = urlParts[2]
    const project = await applicationServer.get(`/api/user/userappstore/project?projectid=${projectid}`, req.account.accountid, req.session.sessionid)
    if (!project || project.accountid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    req.project = project
  }
}
