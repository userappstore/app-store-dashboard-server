/* eslint-env mocha */
const assert = require('assert')
const Handler = require('./install-account-menu.js')
const TestHelper = require('../../test-helper.js')
const dashboard = require('@userdashboard/dashboard')

describe('content/install-account-menu', () => {
  describe('ReducedIframeSandbox#template', () => {
    it('should do nothing when not within install', async () => {
      const templateDoc = dashboard.HTML.parse(global.packageJSON.templateHTML)
      const req = TestHelper.createRequest(`/create-collection`)
      req.install = {
        object: 'install',
        installid: 'test'
      }
      await Handler.template(req, null, templateDoc)
      const installContainer = templateDoc.getElementById(`account-${req.install.installid}`)
      assert.strictEqual(installContainer, undefined)
    })

    it('should add the install settings to account menu', async () => {
      const templateDoc = dashboard.HTML.parse(global.packageJSON.templateHTML)
      const req = TestHelper.createRequest(`/install/test/home`)
      req.install = {
        object: 'install',
        installid: 'test'
      }
      await Handler.template(req, null, templateDoc)
      const installContainer = templateDoc.getElementById(`account-${req.install.installid}`)
      assert.notStrictEqual(installContainer, undefined)
      assert.notStrictEqual(installContainer, null)
    })
  })
})
