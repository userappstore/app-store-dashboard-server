const remap = [
  { tag: 'a', attribute: 'href' },
  { tag: 'link', attribute: 'href' },
  { tag: 'script', attribute: 'src' },
  { tag: 'img', attribute: 'src' }
]

module.exports = {
  page: (req, _, doc) => {
    if (!req.install) {
      return
    }
    for (const item of remap) {
      const elements = doc.getElementsByTagName(item.tag)
      if (!elements || !elements.length) {
        continue
      }
      for (const element of elements) {
        if (!element || !element.attr || !element.attr[item.attribute]) {
          continue
        }
        if (element.attr[item.attribute].startsWith('/')) {
          element.attr[item.attribute] = '/install/' + req.install.installid + element.attr[item.attribute]
        }
      }
    }
  },
  template: async (req, _, templateDoc) => {
    if (!req.install) {
      return
    }
    // add installid to subscription and organization links in the navigation
    const navbar = templateDoc.getElementById('navigation')
    if (req.urlPath.startsWith('/account/')) {
      if (navbar.child && navbar.child.length) {
        for (const child of navbar.child) { 
          if (!child.attr || !child.attr.href) {
            continue
          }
          if (child.attr.href === '/account' || child.attr.href.startsWith('/account/')) {
            child.attr.href = `/account/${req.install.installid}` + child.attr.href.substring('/account'.length)
            continue
          }
          if (child.attr.href.startsWith('/')) {
            child.attr.href = `/install/${req.install.installid}${child.attr.href}`
            child.child[0].text = req.install.text
            continue
          }
        }
      }
    }
    // add installid to links in the app navigation
    const application = templateDoc.getElementById('application-navigation')
    if (!application.child || !application.child.length) {
      return
    }
    if (application.attr.style && application.attr.style.join(' ') === 'display: none') {
      return
    }
    for (const child of application.child) {
      if (!child.attr || !child.attr.href) {
        continue
      }
      child.attr.href = `/install/${req.install.installid}${child.attr.href}`
    }
  }
}
