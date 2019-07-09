const dashboard = require('@userdashboard/dashboard')

module.exports = {
  template: async (req, _, templateDoc) => {
    if (!req.install || (!req.urlPath.startsWith('/account/') && !req.urlPath.startsWith('/install/'))) {
      return    
    }
    // add 'within the app' account management links
    const accountMenu = templateDoc.getElementById('account-menu')
    dashboard.HTML.renderTemplate(templateDoc, req.install, 'install-account-menu', accountMenu)
    accountMenu.child.unshift(accountMenu.child.pop())
    // add the main navbar
    if (req.urlPath.startsWith('/install/')) {
      const navigation = templateDoc.getElementById('navigation')
      dashboard.HTML.renderTemplate(templateDoc, null, 'opened-install-navbar', navigation)
      navigation.setAttribute('style', '')
    }
  }
}
