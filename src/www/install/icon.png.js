const applicationServer = require('../../application-server.js')
const dashboard = require('@userappstore/dashboard')
const fs = require('fs')
const path = require('path')

module.exports = {
  before: beforeRequest,
  get: renderFile
}

async function beforeRequest(req) {
  if (!req.query || !req.query.installid) {
    throw new Error('invalid-installid')
  }
  const install = await applicationServer.get(`/api/user/userappstore/install?installid=${req.query.installid}`, req.account.accountid, req.session.sessionid)
  if (!install) {
    throw new Error('invalid-installid')
  }
  let icon
  if (!install.icon) {
    if (!defaultIcon) {
      const iconPath = path.join(__dirname, './default-icon.png')
      defaultIcon = fs.readFileSync(iconPath)
    }
    icon = defaultIcon
  } else {
    try {
      icon = await dashboard.Storage.readImage('icon/' + install.icon + '.png')
    } catch (error) {
    }
  }
  req.data = { install, icon }
}

function renderFile (req, res) {
  res.statusCode = 200
  res.setHeader('content-type', 'image/png')
  res.setHeader('content-length', req.data.icon.length)
  return res.end(req.data.icon, 'binary')
}
