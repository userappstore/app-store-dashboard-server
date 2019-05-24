/* eslint-env mocha */
const assert = require('assert')
const puppeteer = require('puppeteer')
const TestHelperBrowser = require('../../test-helper-browser.js')
const TestHelper = require('@userappstore/stripe-subscriptions/test-helper.js')
const testUserData = require('@userappstore/dashboard/test-data.json')
const headless = process.env.SHOW_BROWSERS !== 'true'

describe(`tests/cancelling-subscription-paid-credit`, () => {
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
    // create connect publisher account
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
      username: 'publisher-username',
      password: 'publisher-password',
      confirm: 'publisher-password'
    })
    await ownerTab.reload()
    // create and share project to be published 
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
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
    await TestHelperBrowser.completeForm(developerTab, {})
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    // create connect registration
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await developerTab.hover('#account-menu-container')
    await developerTab.waitFor(400)
    await TestHelperBrowser.clickPageLink(developerTab, 'Stripe Connect accounts')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(developerTab, 'Start individual registration')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    const createRegistrationFrame = await developerTab.frames().find(f => f.name() === 'application-iframe')
    await createRegistrationFrame.evaluate(el => el.checked = true, await createRegistrationFrame.$('#individual'))
    await TestHelperBrowser.completeForm(developerTab, {
      country: 'United Kingdom'
    })
    await developerTab.waitForSelector('#submit-form', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(developerTab, {
      username: 'publisher-username',
      password: 'publisher-password',
      'remember-minutes': ''
    })
    // registration information
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(developerTab, 'Start registration')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    const registrationInformationFrame = await developerTab.frames().find(f => f.name() === 'application-iframe')
    await registrationInformationFrame.waitForSelector('#id_scan', { waitLoad: true, waitNetworkIdle: true })
    const idScanUpload = await registrationInformationFrame.$('#id_scan')
    await idScanUpload.uploadFile(`${global.applicationPath}/test-documentid-success.png`)
    await TestHelperBrowser.completeForm(developerTab, {
      first_name: testUserData[1].firstName,
      last_name: testUserData[1].lastName,
      day: '1',
      month: '1',
      year: '2000',
      line1: '123 Sesame Street',
      city: 'London',
      state: 'London',
      postal_code: 'EC1A 1AA'
    })
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    // payment information    
    await TestHelperBrowser.clickFrameLink(developerTab, 'Setup payment information')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    const paymentInformationFrame = await developerTab.frames().find(f => f.name() === 'application-iframe')
    await paymentInformationFrame.waitForSelector('#submit-form', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(developerTab, {
      account_holder_name: testUserData[1].firstName + ' ' + testUserData[1].lastName,
      currency: 'GBP',
      sort_code: '108800',
      account_number: '00012345'
    })
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developerTab, 'Submit')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(developerTab, {})
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    // create app
    await TestHelperBrowser.clickPageLink(developerTab, 'Home')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developerTab, 'Apps')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    const appsFrame = await developerTab.frames().find(f => f.name() === 'application-iframe')
    appsFrame.waitForSelector('#no-apps')
    await TestHelperBrowser.clickFrameLink(developerTab, 'Create app')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    const createAppFrame = await developerTab.frames().find(f => f.name() === 'application-iframe')
    await createAppFrame.waitForSelector('#submit-form', { waitLoad: true, waitNetworkIdle: true })
    await createAppFrame.evaluate(el => el.selectedIndex = 1, await createAppFrame.$('#stripeid'))
    await developerTab.waitFor(400)
    await createAppFrame.evaluate(el => el.selectedIndex = 1, await createAppFrame.$('#application_fee'))
    await developerTab.waitFor(400)
    await createAppFrame.evaluate(el => el.selectedIndex = 1, await createAppFrame.$('#serverid'))
    await TestHelperBrowser.completeForm(developerTab, {
      appid: `test-app-${global.testNumber}`
      // application_fee: '5%',
      // serverid: 'test-project',
      // stripeid: testUserData[1].firstName + ' ' + testUserData[1].lastName
    })
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(developerTab, 'Subscriptions')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    const createProfileFrame = await developerTab.frames().find(f => f.name() === 'application-iframe')
    await createProfileFrame.waitForSelector('#submit-form', { waitLoad: true, waitNetworkIdle: true })
    // setup owner profile
    await TestHelperBrowser.completeForm(developerTab, {
      email: testUserData[1].email,
      'first-name': testUserData[1].firstName,
      'last-name': testUserData[1].lastName,
    })
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developerTab, 'Subscriptions')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(developerTab, 'Create new product')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(developerTab, {
      name: 'Unlimited',
      unit_label: 'subscription',
      statement_descriptor: 'UNL JSON FORMAT'
    })
    await developerTab.waitFor(400)
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developerTab, 'Publish')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(developerTab, {})
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developerTab, 'Subscriptions')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(developerTab, 'Create new plan')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    const createPlanFrame = await developerTab.frames().find(f => f.name() === 'application-iframe')
    await createPlanFrame.evaluate(el => el.selectedIndex = 1, await createPlanFrame.$('#productid'))
    await TestHelperBrowser.completeForm(developerTab, {
      planid: 'gold',
      nickname: 'GOLD',
      amount: '999',
      interval: 'month',
      'currency-select': 'United States Dollar'
    })
    await developerTab.waitFor(400)
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developerTab, 'Publish')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(developerTab, {})
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developerTab, 'Stripe Subscriptions')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    // publish on app store
    await TestHelperBrowser.clickPageLink(developerTab, 'UserAppStore')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developerTab, 'Apps')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(developerTab, `test-app-${global.testNumber}`)
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developerTab, 'Store page')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    // preset the icon, screenshot1, screenshot2, screenshot3, screenshot4
    const storePageFrame = await developerTab.frames().find(f => f.name() === 'application-iframe')
    await storePageFrame.waitForSelector('#upload-icon')
    const iconUpload = await storePageFrame.$('#upload-icon')
    await iconUpload.uploadFile(`${global.applicationPath}/test-icon.png`)
    const screenshot1Upload = await storePageFrame.$('#upload-screenshot1')
    await screenshot1Upload.uploadFile(`${global.applicationPath}/test-screenshot.jpg`)
    const screenshot2Upload = await storePageFrame.$('#upload-screenshot2')
    await screenshot2Upload.uploadFile(`${global.applicationPath}/test-screenshot.jpg`)
    const screenshot3Upload = await storePageFrame.$('#upload-screenshot3')
    await screenshot3Upload.uploadFile(`${global.applicationPath}/test-screenshot.jpg`)
    const screenshot4Upload = await storePageFrame.$('#upload-screenshot4')
    await screenshot4Upload.uploadFile(`${global.applicationPath}/test-screenshot.jpg`)
    await TestHelperBrowser.completeForm(developerTab, {
      name: 'JSON formatter',
      tag1: 'JSON',
      tag2: 'Converter',
      tag3: 'Utility',
      tag4: 'Tool',
      description: 'JSON Formatter prettifies JSON or minimizes it.  Subscriptions include unlimited access to convert as much JSON as your browser can carry.'
    })
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developerTab, 'Publish')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(developerTab, {})
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    // create the customer
    const browser3 = await puppeteer.launch({
      headless,
      args: ['--window-size=1440,900', '--window-position=558,1105', '--incognito'],
      slowMo: 0
    })
    const browser3Pages = await browser3.pages()
    const customer1Tab = browser3Pages[0]
    await customer1Tab.setViewport({ width: 1440, height: 900 })
    await customer1Tab.goto(global.dashboardServer, { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(customer1Tab, {
      username: 'customer1-username',
      password: 'customer1-password',
      confirm: 'customer1-password'
    })
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await ownerTab.reload()
    await TestHelperBrowser.clickPageLink(customer1Tab, 'Home')
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(customer1Tab, 'JSON formatter')
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(customer1Tab, 'Install')
    await customer1Tab.waitFor(400)
    await customer1Tab.waitForSelector('#submit-form', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(customer1Tab, {})
    await customer1Tab.waitFor(400)
    await customer1Tab.waitForSelector('#submit-form', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(customer1Tab, {})
    await customer1Tab.waitFor(400)
    await customer1Tab.waitForSelector('#submit-form', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(customer1Tab, 'Add new profile')
    await customer1Tab.waitForSelector('#submit-button', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(customer1Tab, {
      description: 'boe',
      email: testUserData[2].email,
      number: '4111111111111111',
      cvc: '111',
      exp_month: '1',
      exp_year: (new Date().getFullYear() + 1).toString().substring(2),
      name: `${testUserData[2].firstName} ${testUserData[2].lastName}`
    })
    await customer1Tab.waitForSelector('#submit-form', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(customer1Tab, {
      username: 'customer1-username',
      password: 'customer1-password',
      'remember-minutes': ''
    })
    await customer1Tab.waitForSelector('#submit-form', { waitLoad: true, waitNetworkIdle: true })
    await customer1Tab.waitForSelector('#customerid', { waitLoad: true, waitNetworkIdle: true })
    await customer1Tab.evaluate(el => el.selectedIndex = 1, await customer1Tab.$('#customerid'))
    await TestHelperBrowser.completeForm(customer1Tab, {})
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    // customer1 cancels the subscription
    await TestHelper.waitForWebhook('invoice.updated', (stripeEvent) => {
      return true
    })
    await TestHelper.waitForWebhook('charge.succeeded', (stripeEvent) => {
      return true
    })
    await TestHelperBrowser.clickPageLink(customer1Tab, 'UserAppStore')
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(customer1Tab, 'Subscriptions')
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    // customer 1 cancels subscription
    await TestHelperBrowser.clickFrameLink(customer1Tab, 'Cancel')
    await customer1Tab.waitForSelector('#application-iframe')
    const cancelFrame = await customer1Tab.frames().find(f => f.name() === 'application-iframe')
    await cancelFrame.evaluate(el => el.checked = true, await cancelFrame.$('#credit'))
    await TestHelperBrowser.completeForm(customer1Tab, {})
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    // customer 1 has no installs and an uninstall for the app
    await TestHelperBrowser.clickPageLink(customer1Tab, 'UserAppStore')
    await customer1Tab.waitForSelector('#application-iframe')
    await TestHelperBrowser.clickPageLink(customer1Tab, 'Manage installs')
    await customer1Tab.waitForSelector('#application-iframe')
    await TestHelperBrowser.clickPageLink(customer1Tab, 'Uninstalled')
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    const uninstalled1Frame = await customer1Tab.frames().find(f => f.name() === 'application-iframe')
    const uninstall1Link = await uninstalled1Frame.$x(`//a[contains(text(), 'test-app-${global.testNumber}')]`)
    assert.strictEqual(uninstall1Link.length, 1)
    // customer 1 has a credit 
    await TestHelperBrowser.clickPageLink(customer1Tab, 'UserAppStore')
    await customer1Tab.waitForSelector('#application-iframe')
    await TestHelperBrowser.clickPageLink(customer1Tab, 'Credits')
    await customer1Tab.waitForSelector('#application-iframe')
    const creditsFrame = await customer1Tab.frames().find(f => f.name() === 'application-iframe')
    const creditCell = await creditsFrame.$x(`//td[contains(text(), 'cancellation')]`)
    assert.strictEqual(creditCell.length, 1)
    browser1.close()
    browser2.close()
    browser3.close()
  })
})
