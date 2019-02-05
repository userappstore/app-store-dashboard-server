/* eslint-env mocha */
const assert = require('assert')
const Handler = require('./remap-project-links.js')
const TestHelper = require('../../test-helper.js')
const dashboard = require('@userappstore/dashboard')

describe('content/remap-project-links', () => {
  describe('RemapProjectLinks#page', () => {
    it('should do nothing outside of project preview', async () => {
      const owner = await TestHelper.createOwner()
      const project = await TestHelper.createProject(owner, {
        'home.html': '<html><body><a id="test-link" href="/home">Test link</a></body></html>'
      })
      const doc = dashboard.HTML.parse(`<html>
      <body>
        <a id="a-test" href="/home">Home</a>
        <script id="script-test" src="/something/else/script.js" />
        <link id="link-test" href="/static/style.css" rel="stylesheet" />
      </body>
      </html>`)
      const req = TestHelper.createRequest(`/apps`)
      req.account = owner.account
      req.session = owner.session
      req.project = owner.project
      await Handler.page(req, null, doc)
      const a = doc.getElementById('a-test')
      assert.strictEqual(a.attr.href, `/home`)
      const script = doc.getElementById('script-test')
      assert.strictEqual(script.attr.src, `/something/else/script.js`)
      const link = doc.getElementById('link-test')
      assert.strictEqual(link.attr.href, `/static/style.css`)
    })
    
    it('should add the projectid to A, SCRIPT, and LINK tags (not IMG)', async () => {
      const owner = await TestHelper.createOwner()
      const project = await TestHelper.createProject(owner, {
        'home.html': '<html><body><a id="test-link" href="/home">Test link</a></body></html>'
      })
      const doc = dashboard.HTML.parse(`<html>
      <body>
        <a id="a-test" href="/home">Home</a>
        <img id="img-test" src="/images/image.png" />
        <script id="script-test" src="/something/else/script.js" />
        <link id="link-test" href="/static/style.css" rel="stylesheet" />
      </body>
      </html>`)
      const req = TestHelper.createRequest(`/project/${project.projectid}/home`)
      req.account = owner.account
      req.session = owner.session
      req.project = owner.project
      await Handler.page(req, null, doc)
      const a = doc.getElementById('a-test')
      assert.strictEqual(a.attr.href, `/project/${req.project.projectid}/home`)
      const img = doc.getElementById('img-test')
      assert.strictEqual(img.attr.src, `/images/image.png`)
      const script = doc.getElementById('script-test')
      assert.strictEqual(script.attr.src, `/project/${req.project.projectid}/something/else/script.js`)
      const link = doc.getElementById('link-test')
      assert.strictEqual(link.attr.href, `/project/${req.project.projectid}/static/style.css`)
   })
  })

  describe('RemapProjectLinks#template', () => {
    it('should do nothing outside the project preview', async () => {
      const owner = await TestHelper.createOwner()
      await TestHelper.createProject(owner)
      const req = TestHelper.createRequest(`/install/test/home`)
      req.account = owner.account
      req.session = owner.session
      req.install = {
        installid: 'test'
      }
      const templateDoc = dashboard.HTML.parse(`<html>
        <body>
          <nav id="application-navigation">
            <a href="/home">Home</a>
            <a href="/home#anchor">Something</a>
            <a href="/home?x=y">Variables</a>
          </nav>
        </body>
        </html>`)
      await Handler.template(req, null, templateDoc)
      const navigation = templateDoc.getElementById('application-navigation')
      const links = navigation.getElementsByTagName(`a`)
      assert.strictEqual(links[0].attr.href, `/home`)
      assert.strictEqual(links[1].attr.href, `/home#anchor`)
      assert.strictEqual(links[2].attr.href, `/home?x=y`)
    })
    
    it('should add the projectid to template menu links', async () => {
      const owner = await TestHelper.createOwner()
      await TestHelper.createProject(owner)
      const req = TestHelper.createRequest(`/project/${owner.project.projectid}/home`)
      req.account = owner.account
      req.session = owner.session
      req.project = owner.project
      const templateDoc = dashboard.HTML.parse(`<html>
        <body>
          <nav id="application-navigation">
            <a href="/home">Home</a>
            <a href="/home#anchor">Something</a>
            <a href="/home?x=y">Variables</a>
          </nav>
        </body>
        </html>`)
      await Handler.template(req, null, templateDoc)
      const navigation = templateDoc.getElementById('application-navigation')
      const links = navigation.getElementsByTagName(`a`)
      assert.strictEqual(links[0].attr.href, `/project/${owner.project.projectid}/home`)
      assert.strictEqual(links[1].attr.href, `/project/${owner.project.projectid}/home#anchor`)
      assert.strictEqual(links[2].attr.href, `/project/${owner.project.projectid}/home?x=y`)
    })
  })
})
