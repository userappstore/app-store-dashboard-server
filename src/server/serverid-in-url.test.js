/* eslint-env mocha */
const assert = require('assert')
const Handler = require('./serverid-in-url.js')
const TestHelper = require('../../test-helper.js')

describe('server/serverid-in-url', () => {
  describe('ServerIDInURL#after', () => {
    it('should do nothing when not within a /administrator/ request', async () => {
      const req = TestHelper.createRequest(`/create-collection`)
      await Handler.after(req)
      assert.strictEqual(req.server, undefined)
    })

    it('should bind the server information to req', async () => {
      const owner = await TestHelper.createOwner()
      await TestHelper.createProject(owner)
      await TestHelper.shareProject(owner, owner.project.projectid)
      await TestHelper.createOwnerAccount(owner, owner.project.serverid)
      const req = TestHelper.createRequest(`/administrator/${owner.project.serverid}/sessions`)
      req.account = owner.account
      req.session = owner.session
      await Handler.after(req)
      assert.notStrictEqual(req.server, undefined)
      assert.notStrictEqual(req.server, null)
    })
  })
})
