const dashboard = require('@userappstore/dashboard')
const remap = [
  { tag: 'a', attribute: 'href' }, 
  { tag: 'link', attribute: 'href' }, 
  { tag: 'script', attribute: 'src'},
  { tag: 'img', attribute: 'src' },
  { tag: 'form', attribute: 'action' }
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
    const metaTags = doc.getElementsByTagName('meta')
    if (metaTags && metaTags.length) {
      for (const metaTag of metaTags) {
        if (!metaTag.attr || metaTag.attr['http-equiv'] !== 'refresh') {
          continue
        }
        const parts = metaTag.attr.content.split(';url=')
        const duration = parts[0]
        const url = parts[1]
        if (url.indexOf('/account/') === 0) {
          metaTag.attr.content = `${duration};url=/account/${req.install.installid}/${url.substring('/account/'.length)}`
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

