/* eslint-env mocha */
const assert = require('assert')
const Handler = require('./installid-in-url.js')
const TestHelper = require('../../test-helper.js')

describe('server/installid-in-url', () => {
  describe('InstallIDInURL#after', () => {
    it('should do nothing when not within a /install/ request', async () => {
      const req = TestHelper.createRequest(`/create-collection`)
      await Handler.after(req)
      assert.strictEqual(req.install, undefined)
    })
    
    it('should bind the install information to req', async () => {
      const owner = await TestHelper.createOwner()
      await TestHelper.createProject(owner)
      await TestHelper.shareProject(owner, owner.project.projectid)
      const user = await TestHelper.createUser()
      const install = await TestHelper.installProject(user, owner.project.projectid)
      await TestHelper.createInstallAccount(user, install.installid)
      const req = TestHelper.createRequest(`/install/${install.installid}/home`)
      req.account = user.account
      req.session = user.session
      await Handler.after(req)
      assert.notStrictEqual(req.install, undefined)
      assert.notStrictEqual(req.install, null)
    })
  })
})
