const dashboard = require('@userdashboard/dashboard')

module.exports = {
  template: (req, _, templateDoc) => {
    if (!req.server || (req.urlPath !== '/administrator' && !req.urlPath.startsWith('/administrator/'))) {
      return
    }
    const administratorMenu = templateDoc.getElementById('administrator-menu')
    if (!administratorMenu) {
      throw new Error('where is it...')
    }
    administratorMenu.child = []
    dashboard.HTML.renderTemplate(templateDoc, req.server, 'server-administrator-menu', administratorMenu)
  }
}

