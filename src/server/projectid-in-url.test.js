/* eslint-env mocha */
const assert = require('assert')
const Handler = require('./projectid-in-url.js')
const TestHelper = require('../../test-helper.js')
const dashboard = require('@userappstore/dashboard')

describe('server/projectid-in-url', () => {
  describe('ProjectIDInURL#after', () => {
    it('should do nothing when not within a /project/ request', async () => {
      const req = TestHelper.createRequest(`/create-collection`)
      await Handler.after(req)
      assert.strictEqual(req.project, undefined)
    })

    it('should bind the project information to req', async () => {
      const owner = await TestHelper.createOwner()
      await TestHelper.createProject(owner)
      const req = TestHelper.createRequest(`/project/${owner.project.projectid}/home`)
      req.account = owner.account
      req.session = owner.session
      await Handler.after(req)
      assert.notStrictEqual(req.project, undefined)
      assert.notStrictEqual(req.project, null)
    })
  })
})
