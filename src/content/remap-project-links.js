const remap = [
  { tag: 'a', attribute: 'href' },
  { tag: 'link', attribute: 'href' },
  { tag: 'script', attribute: 'src' },
  // there are no images in projects
  // { tag: 'img', attribute: 'src' }
]

module.exports = {
  page: (req, _, doc) => {
    if (!req.project || !req.url.startsWith('/project/')) {
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
          element.attr[item.attribute] = `/project/${req.project.projectid}` + element.attr[item.attribute]
        }
      }
    }
  },
  template: async (req, _, templateDoc) => {
    if (!req.project || !req.url.startsWith('/project/')) {
      return
    }
    // add projectid to links in the app navigation
    const application = templateDoc.getElementById('application-navigation')
    if (!application.child || !application.child.length) {
      return
    }
    if (application.attr.style === 'display: none') {
      application.attr.style = ''
    }
    for (const child of application.child) {
      if (!child.attr || !child.attr.href) {
        continue
      }
      if (child.attr.href.startsWith('/')) {
        child.attr.href = `/project/${req.project.projectid}${child.attr.href}`
      }
    }
  }
}
