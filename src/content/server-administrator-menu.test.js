/* eslint-env mocha */
const assert = require('assert')
const Handler = require('./server-administrator-menu.js')
const TestHelper = require('../../test-helper.js')
const dashboard = require('@userappstore/dashboard')

describe('content/server-administrator-menu', () => {
  describe('ReducedIframeSandbox#template', () => {
    it('should do nothing when not within server administration', async () => {
      const templateDoc = dashboard.HTML.parse(global.packageJSON.templateHTML)
      const req = TestHelper.createRequest(`/create-collection`)
      req.server = {
        object: 'server',
        serverid: 'test'
      }
      await Handler.template(req, null, templateDoc)
      const serverContainer = templateDoc.getElementById(`administrator-${req.server.serverid}`)
      assert.strictEqual(serverContainer, undefined)
    })

    it('should add the server settings to account menu', async () => {
      const templateDoc = dashboard.HTML.parse(global.packageJSON.templateHTML)
      const req = TestHelper.createRequest(`/administrator/test/subscriptions/create-plan`)
      req.server = {
        object: 'server',
        serverid: 'test'
      }
      await Handler.template(req, null, templateDoc)
      const serverContainer = templateDoc.getElementById(`administrator-${req.server.serverid}`)
      assert.notStrictEqual(serverContainer, undefined)
      assert.notStrictEqual(serverContainer, null)
    })
  })
})
