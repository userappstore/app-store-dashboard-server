module.exports = {
  page: (req, res, doc) => {
    if (req.urlPath.indexOf('/install/') !== 0 && req.urlPath.indexOf('/project/') !== 0) {
      return
    }
    const appNavigation = doc.getElementById('app-navbar')
    req.data = { appNavigation }
  },
  template: async (req, res, templateDoc) => {
    if (req.appid === global.appid) {
      return
    }
    // remove the navigation bar when not needed
    const applicationNavigation = templateDoc.getElementById('application-navigation')
    if (req.urlPath.indexOf('/install/') !== 0 && req.urlPath.indexOf('/project/') !== 0) {
      applicationNavigation.parentNode.removeChild(applicationNavigation)
      return
    }
    // reduced iframe sandbox for installs and projects
    const iframe = templateDoc.getElementById('application-iframe')
    iframe.attr.sandbox = 'allow-top-navigation allow-scripts allow-forms'
    // apply the install or project's navigation or remove it 
    if (!req.data || !req.data.appNavigation) {
      applicationNavigation.parentNode.removeChild(applicationNavigation)
      return
    }
    applicationNavigation.child[0].child = req.data.appNavigation.child    
  }
}
