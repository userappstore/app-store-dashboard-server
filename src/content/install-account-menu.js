const dashboard = require('@userappstore/dashboard')

module.exports = {
  template: async (req, _, templateDoc) => {
    if (!req.install || (!req.urlPath.startsWith('/account/') && !req.urlPath.startsWith('/install/'))) {
      return    
    }
    const accountMenu = templateDoc.getElementById('account-menu')
    dashboard.HTML.renderTemplate(templateDoc, req.install, 'install-account-menu', accountMenu)
    accountMenu.child.unshift(accountMenu.child.pop())
  }
}
