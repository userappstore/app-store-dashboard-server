module.exports = {
  template: (req, res, templateDoc) => {
    const applicationNavigation = templateDoc.getElementById('application-navigation')
    if (req.urlPath.indexOf('/app/') !== 0 &&
        req.urlPath.indexOf('/project/') !== 0) {
      applicationNavigation.parentNode.parentNode.removeChild(applicationNavigation.parentNode)
      return
    }
    const appNavbar = templateDoc.getElementById('app-navbar')
    if (!appNavbar || !appNavbar.child || !appNavbar.child.length) {
      applicationNavigation.parentNode.parentNode.removeChild(applicationNavigation.parentNode)
      return
    }
    applicationNavigation.child = []
    const allowedAttributes = ['id', 'href', 'name']
    for (const element of appNavbar.child) {
      if (element.tag !== 'a' && element.tag !== 'span') {
        continue
      }
      if (!element.child || element.child.length !== 1 || element.child[0].node !== 'text') {
        continue
      }
      if (!element.attr) {
        applicationNavigation.child.push(element)
        continue
      }
      const attrWas = element.attr || {}
      element.attr = {}
      for (const attribute of allowedAttributes) {
        if (!attrWas[attribute]) {
          continue
        }
        element.attr[attribute] = attrWas[attribute]
        if (attribute === 'href' && element.attr[attribute].indexOf('/') !== 0) {
          element.attr.target = '_blank'
        }
      }
      applicationNavigation.child.push(element)
    }
  }
}
