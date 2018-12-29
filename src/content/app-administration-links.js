const dashboard = require('@userappstore/dashboard')

module.exports = {
  page: (req, res, doc) => {
    if (!req.account || req.appid === global.appid || !req.administratorAccount) {
      return
    }
    // add appid to subscription and organization links
    let str = doc.toString().split('/administrator/subscriptions').join(`/administrator/${req.appid}/subscriptions`)
    str = str.split('/administrator/organizations').join(`/administrator/${req.appid}/organizations`)
    doc.child = dashboard.HTML.parse(str).child
  },
  template: (req, res, templateDoc) => {
    if (!req.account || req.appid === global.appid || !req.administratorAccount) {
      return
    }
    // remove the administrator menu for an app owner
    if (!req.administratorAccount.administrator) {
      const administratorMenu = templateDoc.getElementById('administrator-menu-container')
      administratorMenu.parentNode.removeChild(administratorMenu)
    }
    const appid = req.urlPath.split('/')[2]
    const app = { object: 'app', appid }
    const administratorMenu = templateDoc.getElementById('administrator-menu-container')
    dashboard.HTML.renderTemplate(templateDoc, app, 'app-administrator-menu', administratorMenu)
    administratorMenu.child.unshift(administratorMenu.child.pop())
  }
}
