const fs = require('fs')
const path = require('path')
let projectErrorHTML

module.exports = {
  after: renderOpenedInstall
}

async function renderOpenedInstall(req, res) {
  if (!req.query || !req.query.installid) {
    throw new Error('invalid-installid')
  }
  const install = await global.api.user.userappstore.Install.get(req)
  if (!install) {
    throw new Error('invalid-installid')
  }
  let app, project, projectFiles
  if (install.projectid) {
    project = await global.api.user.userappstore.InstalledProject.get(req)
    projectFiles = await global.api.user.userappstore.InstalledProjectFiles.get(req)
  } else if (install.appid) {
    app = await global.api.user.userappstore.InstalledApp.get(req)
    if (app.projectid) {
      project = await global.api.user.userappstore.InstalledProject.get(req)
      projectFiles = await global.api.user.userappstore.InstalledProjectFiles.get(req)
    } else {
      url = app.url
    }
  } else if (install.url) {
    url = install.url
  }
  let doc
  // rendering a project requires substituting root links
  // for their install-specific URLs
  if (project) {
    let projectHTML
    if (projectFiles['home.html'] && projectFiles['home.html'].length) {
      try {
        projectHTML = projectFiles['home.html']
      } catch (error) {
        projectHTML = projectErrorHTML = projectErrorHTML || fs.readFileSync(path.join(__dirname, 'project-error.html').toString())
      }
    }
    projectHTML = projectHTML.split('/home').join(`/project/${project.projectid}/home`)
    projectHTML = projectHTML.split('/public/app.js').join(`/project/${project.projectid}/public/app.js`)
    projectHTML = projectHTML.split('/public/app.css').join(`/project/${project.projectid}/public/app.css`)
    try {
      doc = dashboard.HTML.parse(projectHTML)
    } catch (error) {
      projectHTML = projectErrorHTML = projectErrorHTML || fs.readFileSync(path.join(__dirname, 'project-error.html').toString())
      doc = dashboard.HTML.parse(projectHTML)
    }
  } else if (install.application-server === 'iframe') {
    const templateDoc = ''
    const iframe = templateDoc.getElementById('application-iframe')
    iframe.attr.src = install.url
    iframe.attr.sandbox = 'allow-top-navigation allow-scripts allow-forms'
    return res.end(templateDoc)

  } else {
    // proxy as application server
    return dashboard.Response.proxy()
  }
  if (!doc) {
    throw new Error('invalid-install')
  }
  // On UserAppStore the navbar is used for switching between
  // installs so if project or URL returns a navbar it is
  // renamed, later the 'installs-navbar' content handler puts
  // 'app-navbar' into a secondary navigation in the
  // UserAppStore template.  If you run a standalone copy of
  // Dashboard it will use the navbar
  const installNavbar = doc.getElementById('navbar')
  if (installNavbar) {
    installNavbar.attr.id = 'app-navbar'
  }
  // The project's <template id="head" /> can't be used on
  // UserAppStore because it adds HTML to the <head> of the
  // template.  If you run a standalone copy of Dashboard
  // you can use it to embed fonts, JavaScript etc in the
  // template <head>.
  const installHead = doc.getElementById('head')
  if (installHead) {
    installNavbar.attr.id = 'app-head'
  }
  res.setHeader('content-type', 'text/html')
  return res.end(doc.toString())
}
