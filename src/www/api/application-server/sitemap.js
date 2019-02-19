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
      const html = global.sitemap[url].htmlFilePath || ''
      const nodejs = global.sitemap[url].jsFilePath || ''
      let test
      if (nodejs) {
        const testPath = nodejs.substring(nodejs.length - 3) + '.test.js'
        if (fs.existsSync(`${global.applicationPath}${testPath}`)) {
          test = testPath
        }
      }
      sitemapCopy[url] = { origin, html, nodejs, test }
    }
    return sitemapCopy
  }
}
