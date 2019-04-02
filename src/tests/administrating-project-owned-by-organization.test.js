/* eslint-env mocha */
const assert = require('assert')
const puppeteer = require('puppeteer')
const TestHelperBrowser = require('../../test-helper-browser.js')
const testUserData = require('@userappstore/dashboard/test-data.json')
const headless = process.env.SHOW_BROWSERS !== 'true'

describe(`tests/administrating-project-owned-by-organization`, () => {
  it('should work via UI browsing', async () => {
    global.pageSize = 40
    // create owner account
    const browser1 = await puppeteer.launch({
      headless,
      args: ['--window-size=1440,900', '--window-position=558,155', '--incognito'],
      slowMo: 0
    })
    const ownerPages = await browser1.pages()
    const ownerTab = ownerPages[0]
    await ownerTab.setViewport({ width: 1440, height: 900 })
    await ownerTab.goto(global.dashboardServer, { waitLoad: true, waitNetworkIdle: true })
    await ownerTab.waitForSelector('body')
    await TestHelperBrowser.completeForm(ownerTab, {
      username: 'owner-username',
      password: 'owner-password',
      confirm: 'owner-password'
    })
    await ownerTab.waitForSelector('#application-iframe')
    await ownerTab.hover('#administrator-menu-container')
    await ownerTab.waitFor(400)
    await TestHelperBrowser.clickPageLink(ownerTab, 'Dashboard administration')
    await ownerTab.waitForSelector('#application-iframe')
    await TestHelperBrowser.clickPageLink(ownerTab, 'Accounts')
    await ownerTab.waitForSelector('#application-iframe')
    // create developer account
    const browser2 = await puppeteer.launch({
      headless,
      args: ['--window-size=1440,900', '--window-position=2098,155', '--incognito'],
      slowMo: 0
    })
    let developerPages = await browser2.pages()
    let developerTab = developerPages[0]
    await developerTab.setViewport({ width: 1440, height: 900 })
    await developerTab.goto(global.dashboardServer, { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(developerTab, {
      username: 'developer-username',
      password: 'developer-password',
      confirm: 'developer-password'
    })
    await ownerTab.reload()
    // create organization and invitation
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await developerTab.hover('#account-menu-container')
    await developerTab.waitFor(400)
    await TestHelperBrowser.clickPageLink(developerTab, 'Manage organizations')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(developerTab, 'Create organization')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(developerTab, {
      name: 'My organization',
      email: testUserData[2].email
    })
    await developerTab.waitForSelector('#submit-form', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(developerTab, {
      username: 'developer-username',
      password: 'developer-password',
      'remember-minutes': ''
    })
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developerTab, 'Invitations')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(developerTab, 'Create invitation')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(developerTab, {
      code: 'the-invitation-code'
    })
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    const invitationLinkFrame = await developerTab.frames().find(f => f.name() === 'application-iframe')
    const invitationid = await invitationLinkFrame.$eval('.link', e => e.value)
    await TestHelperBrowser.clickPageLink(developerTab, 'Home')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    // developer shares the project
    await TestHelperBrowser.clickPageLink(developerTab, 'Projects')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(developerTab, 'Create project')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(developerTab, {
      projectid: `test-project-${global.testNumber}`
    })
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developerTab, 'Share')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(developerTab, {
      organizationid: 'My organization'
    })
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developerTab, 'Home')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developerTab, 'Application servers')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(developerTab, 'Administration')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(developerTab, {
      email: testUserData[1].email,
      'first-name': testUserData[1].firstName,
      'last-name': testUserData[1].lastName,
    })
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    // create the second developer and organization member
    const browser3 = await puppeteer.launch({
      headless,
      args: ['--window-size=1440,900', '--window-position=2098,1105', '--incognito'],
      slowMo: 0
    })
    const browser3Pages = await browser3.pages()
    const developer2Tab = browser3Pages[0]
    await developer2Tab.setViewport({ width: 1440, height: 900 })
    await developer2Tab.goto(global.dashboardServer, { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(developer2Tab, {
      username: 'developer2-username',
      password: 'developer2-password',
      confirm: 'developer2-password'
    })
    await ownerTab.reload()
    await developer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await developer2Tab.hover('#account-menu-container')
    await developer2Tab.waitFor(400)
    await TestHelperBrowser.clickPageLink(developer2Tab, 'Manage organizations')
    await developer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developer2Tab, 'Accept invitation')
    await developer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(developer2Tab, {
      invitationid,
      name: `${testUserData[3].firstName} ${testUserData[3].lastName}`,
      email: testUserData[3].email,
      code: 'the-invitation-code'
    })
    await developer2Tab.waitForSelector('#submit-form')
    await TestHelperBrowser.completeForm(developer2Tab, {
      username: 'developer2-username',
      password: 'developer2-password',
      'remember-minutes': ''
    })
    await developer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developer2Tab, 'Home')
    await developer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developer2Tab, 'Application servers')
    await developer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(developer2Tab, 'Administration')
    await developer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(developer2Tab, {
      email: testUserData[3].email,
      'first-name': testUserData[3].firstName,
      'last-name': testUserData[3].lastName,
    })
    await developer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    const pageTitle = await developer2Tab.title()
    assert.strictEqual(pageTitle, 'Administration')
    browser1.close()
    browser2.close()
    browser3.close()
  })
})
