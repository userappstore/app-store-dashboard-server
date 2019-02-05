const dashboard = require('@userappstore/dashboard')
const remap = [
  { tag: 'a', attribute: 'href' }, 
  { tag: 'link', attribute: 'href' }, 
  { tag: 'script', attribute: 'src'},
  { tag: 'img', attribute: 'src' }
]

module.exports = {
  page: (req, _, doc) => {
    if (!req.server || (req.urlPath !== '/administrator' && !req.urlPath.startsWith('/administrator/'))) {
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
        if (value === '/administrator' || value.startsWith('/administrator/')) {
          element.attr[item.attribute] = `/administrator/${req.server.serverid}` + value.substring(`/administrator`.length)
        }
      }
    }
  },
  template: (req, _, templateDoc) => {
    if (!req.server || (req.urlPath !== '/administrator' && !req.urlPath.startsWith('/administrator/'))) {
      return
    }
    const navbar = templateDoc.getElementById('navigation')
    if (!navbar.child || !navbar.child.length) {
      return
    }
    templateDoc.child = dashboard.HTML.parse(templateDoc.toString().split('serveridPlaceHolder').join(req.server.serverid)).child
  }
}

