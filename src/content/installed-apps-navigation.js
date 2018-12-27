const dashboard = require('@userappstore/dashboard')
const applicationServer = require('../application-server.js')

module.exports = {
  template: async (req, res, templateDoc) => {
    if (!req.account) {
      return
    }
    const installs = await applicationServer.get(`/api/user/userappstore/installs?accountid=${req.account.accountid}`, req.account.accountid, req.session.sessionid)
    if (!installs || !installs.length) {
      return
    }
    const collections = await applicationServer.get(`/api/user/userappstore/collections?accountid=${req.account.accountid}`, req.account.accountid, req.session.sessionid)
    if (!collections || !collections.length) {
      dashboard.HTML.renderList(templateDoc, installs, 'install-link', 'ungrouped-menu')
      return
    }
    dashboard.HTML.renderList(templateDoc, collections, 'collection-group', 'collections-menu')
    const appIndex = {}
    const usageIndex = {}
    for (const install of installs) {
      appIndex[install.installid] = install
    }
    for (const collection of collections) {
      if (!collection.items || !collection.items.length) {
        continue
      }
      const apps = []
      for (const installid of collection.items) {
        apps.push(appIndex[installid])
        usageIndex[installid] = true
      }
      if (apps.length) {
        dashboard.HTML.renderList(templateDoc, apps, 'install-link', `installs-list-${collection.collectionid}`)
      }
    }
    const unused = []
    for (const install of installs) {
      if (usageIndex[install.installid]) {
        continue
      }
      unused.push(install)
    }
    if (unused.length) {
      dashboard.HTML.renderList(templateDoc, unused, 'install-link', `ungrouped-menu`)
      const noInstalls = doc.getElementById('no-installs')
      noInstalls.parentNode.removeChild(noInstalls)
    } else {
      const ungroupedMenu = doc.getElementById('ungrouped-menu')
      ungroupedMenu.parentNode.removeChild(ungroupedMenu)
    }
  }
}
