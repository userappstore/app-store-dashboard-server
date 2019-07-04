const bcrypt = require('@userappstore/dashboard/src/bcrypt.js')
const http = require('http')
const https = require('https')
const querystring = require('querystring')
const util = require('util')

module.exports = {
  get: async (path, accountid, sessionid, alternativeServer, alternativeToken, additionalHeaders) => {
    return proxy('GET', path, null, accountid, sessionid, alternativeServer, alternativeToken, additionalHeaders)
  },
  post: async (path, data, accountid, sessionid, alternativeServer, alternativeToken, additionalHeaders) => {
    return proxy('POST', path, data, accountid, sessionid, alternativeServer, alternativeToken, additionalHeaders)
  },
  put: async (path, data, accountid, sessionid, alternativeServer, alternativeToken, additionalHeaders) => {
    return proxy('PUT', path, data, accountid, sessionid, alternativeServer, alternativeToken, additionalHeaders)
  },
  patch: async (path, data, accountid, sessionid, alternativeServer, alternativeToken, additionalHeaders) => {
    return proxy('PATCH', path, data, accountid, sessionid, alternativeServer, alternativeToken, additionalHeaders)
  },
  delete: async (path, data, accountid, sessionid, alternativeServer, alternativeToken, additionalHeaders) => {
    return proxy('DELETE', path, data, accountid, sessionid, alternativeServer, alternativeToken, additionalHeaders)
  }
}

const proxy = util.promisify((method, path, data, accountid, sessionid, alternativeServer, alternativeToken, additionalHeaders, callback) => {
  const applicationServer = alternativeServer || process.env.APPLICATION_SERVER
  const applicationServerToken = alternativeToken || process.env.APPLICATION_SERVER_TOKEN
  const baseURLParts = applicationServer.split('://')
  let host, port
  const colon = baseURLParts[1].indexOf(':')
  if (colon > -1) {
    port = baseURLParts[1].substring(colon + 1)
    host = baseURLParts[1].substring(0, colon)
  } else if (baseURLParts[0] === 'https') {
    port = 443
    host = baseURLParts[1]
  } else if (baseURLParts[0] === 'http') {
    port = 80
    host = baseURLParts[1]
  }
  const salt = bcrypt.genSaltSync(4)
  let token
  if (accountid) {
    token = bcrypt.hashSync(`${applicationServerToken}/${accountid}/${sessionid}`, salt)
  } else {
    token = bcrypt.hashSync(applicationServerToken, salt)
  }
  const requestOptions = {
    host,
    path,
    port,
    method,
    headers: additionalHeaders || {}
  }

  requestOptions.headers['x-dashboard-server'] = process.env.DASHBOARD_SERVER
  requestOptions.headers['x-dashboard-token'] = token
  if (accountid) {
    requestOptions.headers['x-accountid'] = accountid
    requestOptions.headers['x-sessionid'] = sessionid
  }
  const protocol = baseURLParts[0] === 'https' ? https : http
  const proxyRequest = protocol.request(requestOptions, (proxyResponse) => {
    let body
    proxyResponse.on('data', (chunk) => {
      body = body ? Buffer.concat([body, chunk]) : new Buffer(chunk)
    })
    return proxyResponse.on('end', () => {
      if (!body) {
        return callback()
      }
      if (proxyResponse.headers['content-type'] && proxyResponse.headers['content-type'].startsWith('application/json')) {
        body = JSON.parse(body.toString('utf-8'))
        return callback(null, body)
      }
      if (proxyResponse.headers['content-type'] && proxyResponse.headers['content-type'].startsWith('text/html')) {
        body = body.toString('utf-8')
        // truncate any preamble
        body = body.substring(body.indexOf('<'))
        // truncate doctype
        if (body.indexOf('<!') === 0) {
          body = body.substring(body.indexOf('>') + 1)
        }
        body = new Buffer(body)
      }
      return callback(null, {
        body,
        headers: proxyResponse.headers
      })
    })
  })
  proxyRequest.on('error', (error) => {
    return callback(error)
  })
  if (data) {
    proxyRequest.write(querystring.stringify(data))
  }
  return proxyRequest.end()
})
