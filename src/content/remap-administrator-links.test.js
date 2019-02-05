/* eslint-env mocha */
const assert = require('assert')
const Handler = require('./remap-administrator-links.js')
const TestHelper = require('../../test-helper.js')
const dashboard = require('@userappstore/dashboard')

describe('content/remap-administrator-links', () => {
  describe('RemapAdministratorLinks#page', () => {
    it('should do nothing outside of server administration', async () => {
      const doc = dashboard.HTML.parse(`<html>
        <body>
          <a id="a-test" href="/administrator/administrators">Administrator accounts</a>
          <img id="img-test" src="/administrator/image.png" />
          <script id="script-test" src="/administrator/script.js" />
          <link id="link-test" href="/administrator/style.css" rel="stylesheet" />
        </body>
        </html>`)
      const req = TestHelper.createRequest(`/create-project`)
      req.server = {
        serverid: 'test'
      }
      await Handler.page(req, null, doc)
      const a = doc.getElementById('a-test')
      assert.strictEqual(a.attr.href, `/administrator/administrators`)
      const img = doc.getElementById('img-test')
      assert.strictEqual(img.attr.src, `/administrator/image.png`)
      const script = doc.getElementById('script-test')
      assert.strictEqual(script.attr.src, `/administrator/script.js`)
      const link = doc.getElementById('link-test')
      assert.strictEqual(link.attr.href, `/administrator/style.css`)
    })

    it('should add the installid to A, SCRIPT, IMG and LINK tags', async () => {
      const doc = dashboard.HTML.parse(`<html>
        <body>
          <a id="a-test" href="/administrator/administrators">Administrator accounts</a>
          <img id="img-test" src="/administrator/image.png" />
          <script id="script-test" src="/administrator/script.js" />
          <link id="link-test" href="/administrator/style.css" rel="stylesheet" />
        </body>
        </html>`)
      const req = TestHelper.createRequest(`/administrator/test/accounts`)
      req.server = {
        serverid: 'test'
      }
      await Handler.page(req, null, doc)
      const a = doc.getElementById('a-test')
      assert.strictEqual(a.attr.href, `/administrator/${req.server.serverid}/administrators`)
      const img = doc.getElementById('img-test')
      assert.strictEqual(img.attr.src, `/administrator/${req.server.serverid}/image.png`)
      const script = doc.getElementById('script-test')
      assert.strictEqual(script.attr.src, `/administrator/${req.server.serverid}/script.js`)
      const link = doc.getElementById('link-test')
      assert.strictEqual(link.attr.href, `/administrator/${req.server.serverid}/style.css`)
    })
  })

  describe('RemapAdministratorLinks#template', () => {
    it('should do nothing outside of server administration', async () => {
      const templateDoc = dashboard.HTML.parse(`<html>
        <body>
          <nav id="navigation">
            <a href="/administrator/serveridPlaceHolder">Home</a>
            <a href="/administrator/serveridPlaceHolder/organizations">Organizations</a>
            <a href="/administrator/serveridPlaceHolder/subscriptions">Subscriptions</a>
          </nav>
        </body>
        </html>`)
      const req = TestHelper.createRequest(`/import-project`)
      await Handler.template(req, null, templateDoc)
      const links = templateDoc.getElementsByTagName('a')
      assert.strictEqual(links[0].attr.href, `/administrator/serveridPlaceHolder`)
      assert.strictEqual(links[1].attr.href, `/administrator/serveridPlaceHolder/organizations`)
      assert.strictEqual(links[2].attr.href, `/administrator/serveridPlaceHolder/subscriptions`)
    })

    it('should replace the serveridPlaceHolder in navigation', async () => {
      const templateDoc = dashboard.HTML.parse(`<html>
        <body>
          <nav id="navigation">
            <a href="/administrator/serveridPlaceHolder">Home</a>
            <a href="/administrator/serveridPlaceHolder/organizations">Organizations</a>
            <a href="/administrator/serveridPlaceHolder/subscriptions">Subscriptions</a>
          </nav>
        </body>
        </html>`)
      const req = TestHelper.createRequest(`/administrator/test/accounts`)
      req.server = {
        serverid: 'test'
      }
      await Handler.template(req, null, templateDoc)
      const links = templateDoc.getElementsByTagName('a')
      assert.strictEqual(links[0].attr.href, `/administrator/${req.server.serverid}`)
      assert.strictEqual(links[1].attr.href, `/administrator/${req.server.serverid}/organizations`)
      assert.strictEqual(links[2].attr.href, `/administrator/${req.server.serverid}/subscriptions`)
    })
  })
})
