/* eslint-env mocha */
const assert = require('assert')
const puppeteer = require('puppeteer')
const TestHelper = require('../test-helper-chrome.js')
const testUserData = require('@userappstore/dashboard/test-data.json')

// Test that users can administrate servers that they own
//
// 1) the owner account registers and idles on the accounts page
// 2) a developer account registers and claims an application 
//    server, then accesses the server administration home

describe(`tests/administrating-application-server`, () => {
  it('should administrate claimed server', async () => {
    global.pageSize = 40
    // owner
    const browser1 = await puppeteer.launch(TestHelper.browserConfiguration())
    const ownerUsername = 'owner-username-' + Math.floor(new Date().getTime() / 1000)
    const ownerTab = await TestHelper.createRegistration(browser1, {
      username: ownerUsername,
      password: 'owner-password',
      confirm: 'owner-password',
      email: 'owner@platform.com',
      'first-name': 'Platform',
      'last-name': 'Owner'
    })
    await TestHelper.hoverItem(ownerTab, 'administrator-menu-container')
    await TestHelper.clickPageLink(ownerTab, 'Dashboard administration')
    await TestHelper.clickPageLink(ownerTab, 'Accounts')
    // developer
    const browser2 = await puppeteer.launch(TestHelper.browserConfiguration())
    const developerUsername = 'developer-username-' + Math.floor(new Date().getTime() / 1000)
    const developerTab = await TestHelper.createRegistration(browser2, {
      username: developerUsername,
      password: 'developer-password',
      confirm: 'developer-password',
      email: 'publisher@account.com',
      'first-name': 'App',
      'last-name': 'Publisher'
    })
    await TestHelper.clickPageLink(ownerTab, 'Accounts')
    await TestHelper.clickPageLink(developerTab, 'Servers')
    await TestHelper.clickPageLink(developerTab, 'Claim domain')
    await TestHelper.completeForm(developerTab, {
      url: 'https://test-application.server7373.synology.me'
    }, '#submit-url-button')
    const verificationFrame = await TestHelper.getApplicationFrame(developerTab)
    const verificationText = await verificationFrame.$eval('#token', e => e.value)
    const testServer = require('http').createServer((_, res) => {
      res.statusCode = 200
      return res.end(verificationText)
    }).listen(8300, '0.0.0.0')
    await TestHelper.completeForm(developerTab, {}, '#submit-claim-button')
    testServer.close()
    await TestHelper.clickPageLink(developerTab, 'Home')
    await TestHelper.clickPageLink(developerTab, 'Servers')
    await TestHelper.clickFrameLink(developerTab, 'Administration')
    await TestHelper.completeForm(developerTab, {
      email: testUserData[1].email,
      'first-name': testUserData[1].firstName,
      'last-name': testUserData[1].lastName,
    })
    const administrationFrame = await TestHelper.getApplicationFrame(developerTab)
    const pageTitle = await administrationFrame.evaluate(() => {
      return document.getElementsByTagName('h1')[0].innerHTML
    })
    assert.strictEqual(pageTitle, 'Administration')
    browser1.close()
    browser2.close()
  })
})
