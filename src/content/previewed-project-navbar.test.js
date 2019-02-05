/* eslint-env mocha */
const assert = require('assert')
const Handler = require('./previewed-project-navbar.js')
const TestHelper = require('../../test-helper.js')
const dashboard = require('@userappstore/dashboard')

describe('content/previewed-project-navbar', () => {
  describe('PreviewedProjectNavbar#page', () => {
    it('should do nothing outside of previewed project', async () => {
      const owner = await TestHelper.createOwner()
      await TestHelper.createProject(owner)
      const req = TestHelper.createRequest(`/apps`)
      req.account = owner.account
      req.session = owner.session
      const doc = dashboard.HTML.parse(`<html>
        <template id="app-navbar">
          <a href="/home">Home</a>
        </template>
      </html>`)
      await Handler.page(req, null, doc)
      assert.strictEqual(req.data, undefined)
    })
    
    it('should bind the app navigation to req', async () => {
      const owner = await TestHelper.createOwner()
      await TestHelper.createProject(owner)
      const req = TestHelper.createRequest(`/project/test/home`)
      req.account = owner.account
      req.session = owner.session
      req.project = owner.project
      const doc = dashboard.HTML.parse(`<html>
        <template id="app-navbar">
          <a href="/home">Home</a>
        </template>
      </html>`)
      await Handler.page(req, null, doc)
      assert.notStrictEqual(req.data.appNavigation, undefined)
      assert.notStrictEqual(req.data.appNavigation, null)
    })
  })

  describe('PreviewedProjectNavbar#template', () => {
    it('should hide app navigation when not needed', async () => {
      const req = TestHelper.createRequest(`/create-collection`)
      req.data = {
        appNavigation: undefined
      }
      const templateDoc = dashboard.HTML.parse(global.packageJSON.templateHTML)
      await Handler.template(req, null, templateDoc)
      const navigation = templateDoc.getElementById('application-navigation')
      assert.strictEqual(navigation.attr.style, 'display: none')
    })

    it('should show app navigation when specified', async () => {
      const owner = await TestHelper.createOwner()
      await TestHelper.createProject(owner)
      const req = TestHelper.createRequest(`/project/${owner.project.projectid}/home`)
      req.project = owner.project
      req.data = {
        appNavigation: dashboard.HTML.parse(`<template id="app-navbar">
        <a href="/home" id="home-link">Home</a>
      </template>`)
      }
      const templateDoc = dashboard.HTML.parse(global.packageJSON.templateHTML)
      await Handler.template(req, null, templateDoc)
      const link = templateDoc.getElementById('home-link')
      assert.notStrictEqual(link, undefined)
      assert.notStrictEqual(link, null)
    })

    it('should only include relative links and spans with text', async () => {
      const owner = await TestHelper.createOwner()
      await TestHelper.createProject(owner)
      const req = TestHelper.createRequest(`/project/${owner.project.projectid}/home`)
      req.project = owner.project
      req.data = {
        appNavigation: dashboard.HTML.parse(`<template id="app-navbar">
          <p id="excluded">this will be excluded</p>
          <a href="http://somewhere">this will be excluded too</a>
          <a href="/home" id="home-link">Home</a>
          <span>/</span>
          <span><img src="https://ignored.com/pic.jpg" /></span>
          <a href="/home#anchor">Anchored link</a>
        </template>`)
      }
      const templateDoc = dashboard.HTML.parse(global.packageJSON.templateHTML)
      await Handler.template(req, null, templateDoc)
      const navigation = templateDoc.getElementById('application-navigation')
      const excluded = navigation.getElementById('excluded')
      assert.strictEqual(excluded, undefined)
      const links = navigation.getElementsByTagName('a')
      assert.strictEqual(links.length, 2)
      assert.strictEqual(links[0].attr.href, `/home`)
      assert.strictEqual(links[1].attr.href, `/home#anchor`)
      const spans = navigation.getElementsByTagName('span')
      assert.strictEqual(spans.length, 1)
      assert.strictEqual(spans[0].child[0].text, '/')
    })
  })
})
