/* eslint-env mocha */
global.applicationPath = __dirname

const stripeKey = {
  api_key: process.env.STRIPE_KEY
}

const TestHelper = module.exports = require('@userappstore/dashboard/test-helper.js')
module.exports.createProject = createProject
module.exports.shareProject = shareProject
module.exports.installProject = installProject
module.exports.createInstallAccount = createInstallAccount
module.exports.createOwnerAccount = createOwnerAccount
module.exports.createCollection = createCollection
module.exports.addCollectionInstall = addCollectionInstall
module.exports.setServerOrganization = setServerOrganization

const createRequestWas = module.exports.createRequest
module.exports.createRequest = (rawURL, method) => {
  const req = createRequestWas(rawURL, method)
  req.stripeKey = stripeKey
  req.userAgent = 'A web browser user agent'
  req.ip = '8.8.8.8'
  req.country = {
    country: {
      iso_code: 'US'
    }
  }
  return req
}

let projectNumber = 0
async function createProject (user, files) {
  const req = TestHelper.createRequest(`/api/user/userappstore/create-project?accountid=${user.account.accountid}`)
  req.account = user.account
  req.session = user.session
  req.body = {
    projectid: `project-${global.testNumber}-${projectNumber++}`
  }
  user.project = await req.post()
  if (files) {
    const req2 = TestHelper.createRequest(`/api/user/userappstore/update-project-files?projectid=${user.project.projectid}`)
    req2.account = user.account
    req2.session = user.session
    req2.body = files
    await req2.patch()
  }
  return user.project
}

async function shareProject (user, projectid) {
  const req = TestHelper.createRequest(`/api/user/userappstore/set-project-shared?projectid=${projectid}`)
  req.account = user.account
  req.session = user.session
  user.project = await req.patch()
  return user.project
}

async function installProject (user, projectid) {
  const req = TestHelper.createRequest(`/api/user/userappstore/create-install?accountid=${user.account.accountid}`)
  req.account = user.account
  req.session = user.session
  req.body = {
    projectid
  }
  user.install = await req.post()
  return user.install
}

async function createInstallAccount (user, installid) {
  const req = TestHelper.createRequest(`/api/user/userappstore/create-install-account?installid=${installid}`)
  req.account = user.account
  req.session = user.session
  req.body = {
    profileid: user.profile.profileid
  }
  user.install = await req.post()
  return user.install
}

async function createOwnerAccount(user, serverid) {
  const req = TestHelper.createRequest(`/api/user/userappstore/create-owner-account?serverid=${serverid}`)
  req.account = user.account
  req.session = user.session
  req.body = {
    profileid: user.profile.profileid
  }
  await req.post()
}

let collectionNumber = 0
async function createCollection (user) {
  const req = TestHelper.createRequest(`/api/user/userappstore/create-collection?accountid=${user.account.accountid}`)
  req.account = user.account
  req.session = user.session
  req.body = {
    name: `collection-${global.testNumber}-${collectionNumber++}`,
    background: '#000',
    text: '#FFF'
  }
  user.collection = await req.post()
  return user.collection
}

async function addCollectionInstall (user, collectionid, installid) {
  const req = TestHelper.createRequest(`/api/user/userappstore/add-collection-install?collectionid=${collectionid}`)
  req.account = user.account
  req.session = user.session
  req.body = {
    installid
  }
  user.collection = await req.post()
  return user.collection
}

async function setServerOrganization (user, serverid, organizationid) {
  const req = TestHelper.createRequest(`/api/user/userappstore/set-application-server-organization?serverid=${serverid}`)
  req.account = user.account
  req.session = user.session
  req.body = {
    organizationid
  }
  user.server = await req.patch()
  return user.server
}
