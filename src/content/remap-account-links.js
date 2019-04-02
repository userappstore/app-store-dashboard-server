const dashboard = require('@userappstore/dashboard')
const remap = [
  { tag: 'a', attribute: 'href' },
  { tag: 'link', attribute: 'href' },
  { tag: 'script', attribute: 'src' },
  { tag: 'img', attribute: 'src' }
]

module.exports = {
  page: (req, _, doc) => {
    if (!req.install || !req.urlPath.startsWith('/account/')) {
      return
    }
    for (const item of remap) {
      const elements = doc.getElementsByTagName(item.tag)
      if (!elements || !elements.length) {
        continue
      }
      for (const element of elements) {
        if (!element || !element.attr) {
          continue
        }
        const value = element.attr[item.attribute]
        if (!value) {
          continue
        }
        if (value === '/account' || value.startsWith('/account/')) {
          element.attr[item.attribute] = `/account/${req.install.installid}` + value.substring(`/account`.length)
        }
      }
    }
  },
  template: (req, _, templateDoc) => {
    if (!req.install || !req.urlPath.startsWith('/account/')) {
      return
    }
    const navbar = templateDoc.getElementById('navigation')
    if (!navbar.child || !navbar.child.length) {
      return
    }
    templateDoc.child = dashboard.HTML.parse(templateDoc.toString().split('installidPlaceHolder').join(req.install.installid)).child
  }
}

