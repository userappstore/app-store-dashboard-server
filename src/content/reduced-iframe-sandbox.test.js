/* eslint-env mocha */
const assert = require('assert')
const Handler = require('./reduced-iframe-sandbox.js')
const TestHelper = require('../../test-helper.js')
const dashboard = require('@userappstore/dashboard')

describe('content/reduced-iframe-sandbox', () => {
  describe('ReducedIframeSandbox#template', () => {
    it('should do nothing when not in install or project', async () => {
      const templateDoc = dashboard.HTML.parse(`<html>
      <body>
      <iframe id="application-iframe" sandbox="unmodified" />
      </body>
      </html>`)
      const req = TestHelper.createRequest(`/create-collection`)
      await Handler.template(req, null, templateDoc)
      const iframe = templateDoc.getElementById('application-iframe')
      assert.strictEqual(iframe.attr.sandbox, `unmodified`)
    })

    it('should reset the iframe sandbox', async () => {
      const templateDoc = dashboard.HTML.parse(`<html>
      <body>
      <iframe id="application-iframe" sandbox="allow-top-navigation allow-scripts allow-forms allow-same-origin allow-popups" />
      </body>
      </html>`)
      const req = TestHelper.createRequest(`/install/test/home`)
      await Handler.template(req, null, templateDoc)
      const iframe = templateDoc.getElementById('application-iframe')
      assert.strictEqual(iframe.attr.sandbox.indexOf('allow-same-origin'), -1)
      assert.strictEqual(iframe.attr.sandbox.indexOf('allow-popups'), -1)
    })
  })
})
