module.exports = {
  auth: false,
  get: async (req) => {
    if (!req.applicationServer) {
      throw new Error('invalid-access')
    }
    const sitemapCopy = {}
    for (const url in global.sitemap) {
      const path = global.sitemap[url].htmlFilePath || global.sitemap[url].jsFilePath
      let origin
      if (path.indexOf('node_modules') === -1) {
        origin = 'dashboard-server'
      } else {
        let moduleName = path.split('node_modules/').pop()
        if (moduleName.indexOf('@') === 0) {
          const nameParts = moduleName.split('/')
          origin = nameParts[0] + '/' + nameParts[1]
        } else {
          origin = moduleName.substring(0, moduleName.indexOf('/'))
        }
      }
      sitemapCopy[url] = origin
    }
    return sitemapCopy
  }
}
