const dashboard = require('@userappstore/dashboard')

module.exports = {
  template: (req, res, templateDoc) => {
    if (!req.account || req.appid === 'app' || !req.administratorAccount) {
      return
    }
    // remove the administrator menu for an app owner
    if (!req.administratorAccount.administrator) {
      const administratorMenu = templateDoc.getElementById('administrator-menu-container')
      administratorMenu.parentNode.removeChild(administratorMenu)
    }
    // add appid to navbar subscription and organization links
    let str = templateDoc.toString().split('/administrator/subscriptions').join(`/administrator/${req.appid}/subscriptions`)
    str = str.split('/administrator/organizations').join(`/administrator/${req.appid}/organizations`)
    str = str.split('<a href="/administrator">Administrator</a>').join(`<a href="/app?appid=${req.appid}">${req.appid}</a>`)
    templateDoc.child = dashboard.HTML.parse(str).child
  },
  page: (req, res, doc) => {
    if (!req.account || req.appid === 'app') {
      return
    }
    // add appid to subscription and organization links
    let str = doc.toString().split('/administrator/subscriptions').join(`/administrator/${req.appid}/subscriptions`)
    str = str.split('/administrator/organizations').join(`/administrator/${req.appid}/organizations`)
    doc.child = dashboard.HTML.parse(str).child
  }
}
