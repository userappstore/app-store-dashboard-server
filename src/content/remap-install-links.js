const remap = [
  { tag: 'a', attribute: 'href' },
  { tag: 'link', attribute: 'href' },
  { tag: 'script', attribute: 'src' },
  { tag: 'img', attribute: 'src' },
  { tag: 'form', attribute: 'action' }
]

module.exports = {
  page: (req, _, doc) => {
    if (!req.install || !req.urlPath.startsWith('/install/')) {
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
        } else if (element.attr[item.attribute].startsWith(`${global.dashboardServer}/`)) {
          element.attr[item.attribute] = element.attr[item.attribute].replace(`${global.dashboardServer}/`, `${global.dashboardServer}/install/${req.install.installid}`)
        }
      }
    }
    // add installid to links in the app navigation
    const application = doc.getElementById('app-navbar')
    if (!application || !application.child || !application.child.length) {
      return
    }
    for (const child of application.child) {
      if (!child.attr || !child.attr.href) {
        continue
      }
      if (child.attr.href.startsWith('/')) {
        child.attr.href = `/install/${req.install.installid}${child.attr.href}`
      } else if (child.attr.href.startsWith(`${global.dashboardServer}/`)) {
        child.attr.href = child.attr.href.replace(`${global.dashboardServer}/`, `${global.dashboardServer}/install/${req.install.installid}`)
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
        if (url.startsWith('/')) {
          metaTag.attr.content = `${duration};url=/install/${req.install.installid}${url}`
        }
      }
    }
  }
}
