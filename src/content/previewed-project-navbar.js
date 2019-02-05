module.exports = {
  page: (req, _, doc) => {
    if (!req.project || !req.urlPath.startsWith('/project/')) {
      return
    }
    const appNavigation = doc.getElementById('app-navbar')
    req.data = { appNavigation }
  },
  template: async (req, _, templateDoc) => {
    const applicationNavigation = templateDoc.getElementById('application-navigation')
    if (!req.project ||
      !req.data ||
      !req.data.appNavigation ||
      !req.data.appNavigation.child ||
      !req.data.appNavigation.child.length ||
      !req.urlPath.startsWith('/project/')) {
      return applicationNavigation.setAttribute('style', 'display: none')
    }
    // add relative links and text-only spans
    applicationNavigation.setAttribute('style', '')
    applicationNavigation.child[0].child = []
    const contents = req.data.appNavigation.child
    for (const item of contents) {
      if (item.tag !== 'a' && item.tag !== 'span') {
        continue
      }
      if (item.tag === 'span' && (item.child.length > 1 || item.child[0].node !== 'text')) {
        continue
      }
      if (item.tag === 'a' && (!item.attr.href || !item.attr.href.startsWith('/'))) {
        continue
      }
      if (item.tag === 'a' && (item.child.length > 1 || item.child[0].node !== 'text')) {
        continue
      }
      applicationNavigation.child[0].child.push(item)
    }
  }
}
