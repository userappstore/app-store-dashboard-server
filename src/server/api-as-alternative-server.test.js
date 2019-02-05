/* eslint-env mocha */
const assert = require('assert')
const Handler = require('./api-as-alternative-server.js')
const TestHelper = require('../../test-helper.js')
const dashboard = require('@userappstore/dashboard')

describe('server/api-as-alternative-server', () => {
  describe('APIAsAlternativeServer#before', () => {
    it('should do nothing when not an application server request', async () => {
      const req = TestHelper.createRequest(`/create-collection`)
      req.headers = {}
      await Handler.before(req)
      assert.strictEqual(req.server, undefined)
    })
    
    it('should superimpose the application server configuration', async () => {
      const owner = await TestHelper.createOwner()
      await TestHelper.createProject(owner)
      await TestHelper.shareProject(owner, owner.project.projectid)
      const user = await TestHelper.createUser()
      const install = await TestHelper.installProject(user, owner.project.projectid)
      await TestHelper.createInstallAccount(user, install.installid)
      const req = TestHelper.createRequest(`/install/${install.installid}/home`)
      req.account = user.account
      req.session = user.session
      req.headers = {
        'x-application-server': owner.project.projectid
      }
      await Handler.before(req)
      assert.notStrictEqual(req.server, undefined)
      assert.notStrictEqual(req.server, null)
    })
  })
})
