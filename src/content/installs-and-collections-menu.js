const applicationServer = require('../application-server.js')
const dashboard = require('@userappstore/dashboard')

module.exports = {
  template: async (req, res, templateDoc) => {
    if (!req.account) {
      return
    }
    const ungroupedMenu = templateDoc.getElementById('ungrouped-menu')
    const installs = await applicationServer.get(`/api/user/userappstore/installs?accountid=${req.account.accountid}&all=true`, req.account.accountid, req.session.sessionid)
    if (!installs || !installs.length) {
      ungroupedMenu.setAttribute('style', 'display: none')
      return
    }
    for (const install of installs) {
      install.subscriptionsEnabled = install.stripeid !== undefined
      install.organizationsEnabled = install.serverid !== undefined
      install.profileCreated = install.accountidSignedIn !== undefined
    }
    const noInstalls = templateDoc.getElementById('no-installs')
    noInstalls.setAttribute('style', 'display: none')
    const collections = await applicationServer.get(`/api/user/userappstore/collections?accountid=${req.account.accountid}&all=true`, req.account.accountid, req.session.sessionid)
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
      const collectionContainer = templateDoc.getElementById(collection.collectionid)
      if (!collection.items || !collection.items.length) {
        collectionContainer.setAttribute('style', 'display: none')
        continue
      }
      const apps = []
      for (const installid of collection.items) {
        apps.push(appIndex[installid])
        usageIndex[installid] = true
      }
      if (apps.length) {
        dashboard.HTML.renderList(templateDoc, apps, 'install-link', `installs-list-${collection.collectionid}`)
      } else {
        collectionContainer.setAttribute('style', 'display: none')
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
    } else {
      ungroupedMenu.setAttribute('style', 'display: none')
    }
  }
}
