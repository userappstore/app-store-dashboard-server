/* eslint-env mocha */
const assert = require('assert')
const Handler = require('./installs-and-collections-menu.js')
const TestHelper = require('../../test-helper.js')
const dashboard = require('@userappstore/dashboard')

describe('content/installs-and-collections-menu', () => {
  describe('InstallsAndCollectionsMenu#template', () => {
    it('should add ungrouped installs to menu', async () => {
      const owner = await TestHelper.createOwner()
      await TestHelper.createProject(owner)
      await TestHelper.shareProject(owner, owner.project.projectid)
      const user = await TestHelper.createUser()
      const install = await TestHelper.installProject(user, owner.project.projectid)
      await TestHelper.createInstallAccount(user, install.installid)
      const req = TestHelper.createRequest(`/install/${install.installid}/home`)
      req.account = user.account
      req.session = user.session
      const templateDoc = dashboard.HTML.parse(global.packageJSON.templateHTML)
      await Handler.template(req, null, templateDoc)
      const ungroupedMenu = templateDoc.getElementById('ungrouped-menu')
      const links = ungroupedMenu.getElementsByTagName('a')
      assert.strictEqual(links[0].attr.href, `/install/${install.installid}/home`)
    })

    it('should hide empty collections', async () => {
      const owner = await TestHelper.createOwner()
      await TestHelper.createProject(owner)
      await TestHelper.shareProject(owner, owner.project.projectid)
      const user = await TestHelper.createUser()
      const install = await TestHelper.installProject(user, owner.project.projectid)
      await TestHelper.createInstallAccount(user, install.installid)
      await TestHelper.createCollection(user)
      const req = TestHelper.createRequest(`/install/${install.installid}/home`)
      req.account = user.account
      req.session = user.session
      const templateDoc = dashboard.HTML.parse(global.packageJSON.templateHTML)
      await Handler.template(req, null, templateDoc)
      const collectionMenu = templateDoc.getElementById(user.collection.collectionid)
      assert.strictEqual(collectionMenu.attr.style, 'display: none')
    })

    it('should add collection with installs to menu', async () => {
      const owner = await TestHelper.createOwner()
      await TestHelper.createProject(owner)
      await TestHelper.shareProject(owner, owner.project.projectid)
      const user = await TestHelper.createUser()
      const install = await TestHelper.installProject(user, owner.project.projectid)
      await TestHelper.createInstallAccount(user, install.installid)
      await TestHelper.createCollection(user)
      await TestHelper.addCollectionInstall(user, user.collection.collectionid, install.installid)
      const req = TestHelper.createRequest(`/install/${install.installid}/home`)
      req.account = user.account
      req.session = user.session
      const templateDoc = dashboard.HTML.parse(global.packageJSON.templateHTML)
      await Handler.template(req, null, templateDoc)
      const collectionMenu = templateDoc.getElementById(user.collection.collectionid)
      const links = collectionMenu.getElementsByTagName('a')
      assert.strictEqual(links[0].attr.href, `/install/${install.installid}/home`)
    })
  })
})
