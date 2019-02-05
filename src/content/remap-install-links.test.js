/* eslint-env mocha */
const assert = require('assert')
const Handler = require('./remap-install-links.js')
const TestHelper = require('../../test-helper.js')
const dashboard = require('@userappstore/dashboard')

describe('content/remap-install-links', () => {
  describe('RemapInstallLinks#page', () => {
    it('should do nothing when not within a /install', async () => {
      const doc = dashboard.HTML.parse(`<html>
      <body>
        <a id="a-test" href="/home">Home</a>
        <img id="img-test" src="/images/image.png" />
        <script id="script-test" src="/something/else/script.js" />
        <link id="link-test" href="/static/style.css" rel="stylesheet" />
      </body>
      </html>`)
      const req = TestHelper.createRequest(`/create-project`)
      await Handler.page(req, null, doc)
      const a = doc.getElementById('a-test')
      assert.strictEqual(a.attr.href, `/home`)
      const img = doc.getElementById('img-test')
      assert.strictEqual(img.attr.src, `/images/image.png`)
      const script = doc.getElementById('script-test')
      assert.strictEqual(script.attr.src, `/something/else/script.js`)
      const link = doc.getElementById('link-test')
      assert.strictEqual(link.attr.href, `/static/style.css`)
    })
    
    it('should add the installid to A, SCRIPT, IMG and LINK tags', async () => {
      const doc = dashboard.HTML.parse(`<html>
      <body>
        <a id="a-test" href="/home">Home</a>
        <img id="img-test" src="/images/image.png" />
        <script id="script-test" src="/something/else/script.js" />
        <link id="link-test" href="/static/style.css" rel="stylesheet" />
      </body>
      </html>`)
      const req = TestHelper.createRequest(`/install/test/home`)
      req.install = {
        installid: 'test'
      }
      await Handler.page(req, null, doc)
      const a = doc.getElementById('a-test')
      assert.strictEqual(a.attr.href, `/install/${req.install.installid}/home`)
      const img = doc.getElementById('img-test')
      assert.strictEqual(img.attr.src, `/install/${req.install.installid}/images/image.png`)
      const script = doc.getElementById('script-test')
      assert.strictEqual(script.attr.src, `/install/${req.install.installid}/something/else/script.js`)
      const link = doc.getElementById('link-test')
      assert.strictEqual(link.attr.href, `/install/${req.install.installid}/static/style.css`)
    })
  })

  describe('RemapInstallLinks#template', () => {
    it('should do nothing when not within a /install', async () => {
      const owner = await TestHelper.createOwner()
      await TestHelper.createProject(owner)
      await TestHelper.shareProject(owner, owner.project.projectid)
      const user = await TestHelper.createUser()
      const install = await TestHelper.installProject(user, owner.project.projectid)
      await TestHelper.createInstallAccount(user, install.installid)
      const req = TestHelper.createRequest(`/projects`)
      req.account = user.account
      req.session = user.session
      const templateDoc = dashboard.HTML.parse(`<html>
        <body>
          <nav id="navigation">
            <a href="/home">Home</a>
            <a href="/something">Something</a>
          </nav>
        </body>
        </html>`)
      await Handler.template(req, null, templateDoc)
      const links = templateDoc.getElementsByTagName('a')
      assert.strictEqual(links[0].attr.href, `/home`)
      assert.strictEqual(links[1].attr.href, `/something`)
    })

    it('should add the installid to template menu links', async () => {
      const owner = await TestHelper.createOwner()
      await TestHelper.createProject(owner)
      await TestHelper.shareProject(owner, owner.project.projectid)
      const user = await TestHelper.createUser()
      const install = await TestHelper.installProject(user, owner.project.projectid)
      await TestHelper.createInstallAccount(user, install.installid)
      const req = TestHelper.createRequest(`/install/${install.installid}/home`)
      req.account = user.account
      req.session = user.session
      req.install = install
      const templateDoc = dashboard.HTML.parse(`<html>
        <body>
          <nav id="navigation"></nav>
          <nav id="application-navigation">
            <a href="/home">Home</a>
            <a href="/something">Something</a>
          </nav>
        </body>
        </html>`)
      await Handler.template(req, null, templateDoc)
      const links = templateDoc.getElementsByTagName('a')
      assert.strictEqual(links[0].attr.href, `/install/${install.installid}/home`)
      assert.strictEqual(links[1].attr.href, `/install/${install.installid}/something`)
    })

    it('should add the installid to account navigation links', async () => {
      const owner = await TestHelper.createOwner()
      await TestHelper.createProject(owner)
      await TestHelper.shareProject(owner, owner.project.projectid)
      const user = await TestHelper.createUser()
      const install = await TestHelper.installProject(user, owner.project.projectid)
      await TestHelper.createInstallAccount(user, install.installid)
      const req = TestHelper.createRequest(`/account/${install.installid}/sessions`)
      req.account = user.account
      req.session = user.session
      req.install = install
      const templateDoc = dashboard.HTML.parse(`<html>
        <body>
          <nav id="navigation">
            <a href="/account/organizations/create-organization">Create organization</a>
            <a href="/account">Account</a>
          </nav>
          <nav id="application-navigation"></nav>
        </body>
        </html>`)
      await Handler.template(req, null, templateDoc)
      const links = templateDoc.getElementsByTagName('a')
      assert.strictEqual(links[0].attr.href, `/account/${install.installid}/organizations/create-organization`)
      assert.strictEqual(links[1].attr.href, `/account/${install.installid}`)
    })
  })
})
