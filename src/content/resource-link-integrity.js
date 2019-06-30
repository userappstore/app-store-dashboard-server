const dashboard = require('@userappstore/dashboard')
const applicationServer = require('../application-server.js')
const fs = require('fs')
const cached = {}

module.exports = {
  page: async (req, _, doc) => {
    if (req.install) {
      return
    }
    const scripts = doc.getElementsByTagName('script')
    if (scripts && scripts.length) {
      for (const script of scripts) {
        if (!script.attr || !script.attr.src) {
          continue
        }
        if (script.attr.integrity) {
          continue
        }
        script.attr.crossorigin = 'anonymous'
        let src = script.attr.src
        const q = src.indexOf('?')
        if (q > -1) {
          src = src.substring(0, q)
        }
        let blob = cached[src]
        if (!blob) {
          const filePath = mapFile(src)
          if (filePath && fs.existsSync(filePath)) {
            blob = cached[src] = fs.readFileSync(filePath)
          } else if (global.applicationServer) {
            const resourceData = await applicationServer.get(src, req.account ? req.account.accountid : null, req.session ? req.session.sessionid : null)
            blob = cached[src] = resourceData.body
          }
        }
        script.attr.integrity = dashboard.Response.sri(blob)
      }
    }
    const links = doc.getElementsByTagName('link')
    if (!links || !links.length) {
      return
    }
    for (const link of links) {
      if (!link.attr || !link.attr.href || link.attr.rel !== 'stylesheet' || link.attr.integrity) {
        continue
      }
      link.attr.crossorigin = 'anonymous'
      let src = link.attr.href
      const q = src.indexOf('?')
      if (q > -1) {
        src = src.substring(0, q)
      }
      let blob = cached[src]
      if (!blob) {
        const filePath = mapFile(src)
        if (filePath && fs.existsSync(filePath)) {
          blob = cached[src] = fs.readFileSync(filePath)
        } else if (global.applicationServer) {
          const resourceData = await applicationServer.get(src, req.account ? req.account.accountid : null, req.session ? req.session.sessionid : null)
          blob = cached[src] = resourceData.body
        }
      }
      link.attr.integrity = dashboard.Response.sri(blob)
    }
  },
  template: async (req, _, templateDoc) => {
    const scripts = templateDoc.getElementsByTagName('script')
    if (scripts && scripts.length) {
      for (const script of scripts) {
        if (!script.attr || !script.attr.src) {
          continue
        }
        if (script.attr.integrity) {
          continue
        }
        script.attr.crossorigin = 'anonymous'
        let src = script.attr.src
        const q = src.indexOf('?')
        if (q > -1) {
          src = src.substring(0, q)
        }
        let blob = cached[src]
        if (!blob) {
          const filePath = mapFile(src)
          if (filePath && fs.existsSync(filePath)) {
            blob = cached[src] = fs.readFileSync(filePath)
          } else if (global.applicationServer) {
            const resourceData = await applicationServer.get(src, req.account ? req.account.accountid : null, req.session ? req.session.sessionid : null)
            blob = cached[src] = resourceDatabody
          }
        }
        script.attr.integrity = dashboard.Response.sri(blob)
      }
    }
    const links = templateDoc.getElementsByTagName('link')
    if (!links || !links.length) {
      return
    }
    for (const link of links) {
      if (!link.attr || !link.attr.href || link.attr.rel !== 'stylesheet' || link.attr.integrity) {
        continue
      }
      link.attr.crossorigin = 'anonymous'
      let src = link.attr.href
      const q = src.indexOf('?')
      if (q > -1) {
        src = src.substring(0, q)
      }
      let blob = cached[src]
      if (!blob) {
        const filePath = mapFile(src)
        if (filePath && fs.existsSync(filePath)) {
          blob = cached[src] = fs.readFileSync(filePath)
        } else if (global.applicationServer) {
          const resourceData = await applicationServer.get(src, req.account ? req.account.accountid : null, req.session ? req.session.sessionid : null)
          blob = cached[src] = resourceData.body
        }
      }
      link.attr.integrity = dashboard.Response.sri(blob)
    }
  }
}

function mapFile(stem) {
  // root /public folder
  let filePath = `${global.rootPath}${stem}`
  if (fs.existsSync(filePath)) {
    return filePath
  }
  // dashboard /public folder
  filePath = `${global.applicationPath}/node_modules/@userappstore/dashboard/src/www${stem}`
  if (fs.existsSync(filePath)) {
    return filePath
  }
  // module /public folder
  for (const moduleName of global.packageJSON.dashboard.moduleNames) {
    filePath = `${global.applicationPath}/node_modules/${moduleName}/src/www${stem}`
    if (fs.existsSync(filePath)) {
      return filePath
    }
  }
  return null
}
