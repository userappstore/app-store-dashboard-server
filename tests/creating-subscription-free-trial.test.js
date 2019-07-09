/* eslint-env mocha */
const assert = require('assert')
const puppeteer = require('puppeteer')
const TestHelper = require('../test-helper-chrome.js')
const testUserData = require('@userdashboard/dashboard/test-data.json')

// Test that users can create subscriptions that commence with
// free trials.
//
// 1) the owner account registers and idles on the accounts page
// 2) a developer account registers and publishes a project to
//    the app store and configures a subscription plan with trial
// 3) a user registers and installs the project from the app
//    store, sets billing information and begins the subscription

describe(`tests/creating-subscription-free-trial`, () => {
  it('should create a subscription with a free trial period', async () => {
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
    await TestHelper.clickPageLink(developerTab, 'Projects')
    await TestHelper.clickFrameLink(developerTab, 'Create project')
    await TestHelper.completeForm(developerTab, {
      projectid: `test-project-${Math.floor(new Date().getTime() / 1000)}`
    })
    await TestHelper.clickPageLink(developerTab, 'Share')
    await TestHelper.completeForm(developerTab, {})
    await TestHelper.hoverItem(developerTab, 'account-menu-container')
    await TestHelper.clickPageLink(developerTab, 'Stripe Connect accounts')
    await TestHelper.clickFrameLink(developerTab, 'Start individual registration')
    const createRegistrationFrame = await TestHelper.getApplicationFrame(developerTab)
    await createRegistrationFrame.evaluate(el => el.checked = true, await createRegistrationFrame.$('#individual'))
    await TestHelper.completeForm(developerTab, {
      country: 'United Kingdom'
    })
    await TestHelper.clickFrameLink(developerTab, 'Start registration')
    const idScanUpload = await TestHelper.awaitFrameElement(developerTab, '#id_scan')
    await idScanUpload.uploadFile(`${global.global.rootPath}/test-documentid-success.png`)
    await TestHelper.completeForm(developerTab, {
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
    await TestHelper.clickPageLink(developerTab, 'Edit payment information')
    await TestHelper.completeForm(developerTab, {
      account_holder_name: testUserData[1].firstName + ' ' + testUserData[1].lastName,
      currency: 'GBP',
      sort_code: '108800',
      account_number: '00012345'
    })
    await TestHelper.clickPageLink(developerTab, 'Submit')
    await TestHelper.completeForm(developerTab, {})
    await TestHelper.clickPageLink(developerTab, 'Home')
    await TestHelper.clickPageLink(developerTab, 'Apps')
    await TestHelper.clickFrameLink(developerTab, 'Create app')
    const createAppFrame = await TestHelper.getApplicationFrame(developerTab)
    await createAppFrame.evaluate(el => el.selectedIndex = 1, await createAppFrame.$('#stripeid'))
    await createAppFrame.evaluate(el => el.selectedIndex = 1, await createAppFrame.$('#application_fee'))
    await createAppFrame.evaluate(el => el.selectedIndex = 1, await createAppFrame.$('#serverid'))
    const appid = `test-app-${Math.floor(new Date().getTime() / 1000)}`
    await TestHelper.completeForm(developerTab, {
      appid,
    })
    await TestHelper.clickFrameLink(developerTab, 'Subscriptions')
    await TestHelper.completeForm(developerTab, {
      email: testUserData[1].email,
      'first-name': testUserData[1].firstName,
      'last-name': testUserData[1].lastName,
    })
    await TestHelper.clickPageLink(developerTab, 'Subscriptions')
    await TestHelper.clickFrameLink(developerTab, 'Create new product')
    await TestHelper.completeForm(developerTab, {
      name: 'Unlimited',
      unit_label: 'subscription',
      statement_descriptor: 'UNL JSON FORMAT'
    })
    await TestHelper.clickPageLink(developerTab, 'Publish')
    await TestHelper.completeForm(developerTab, {})
    await TestHelper.clickPageLink(developerTab, 'Subscriptions')
    await TestHelper.clickFrameLink(developerTab, 'Create new plan')
    const createPlanFrame = await TestHelper.getApplicationFrame(developerTab)
    await createPlanFrame.evaluate(el => el.selectedIndex = 1, await createPlanFrame.$('#productid'))
    await TestHelper.completeForm(developerTab, {
      planid: 'gold',
      nickname: 'GOLD',
      amount: '999',
      interval: 'month',
      trial_period_days: '7',
      'currency-select': 'United States Dollar'
    })
    await TestHelper.clickPageLink(developerTab, 'Publish')
    await TestHelper.completeForm(developerTab, {})
    await TestHelper.clickPageLink(developerTab, 'Stripe Subscriptions')
    await TestHelper.clickPageLink(developerTab, 'Home')
    await TestHelper.clickPageLink(developerTab, 'Apps')
    await TestHelper.clickFrameLink(developerTab, appid)
    await TestHelper.clickPageLink(developerTab, 'Store page')
    const storePageFrame = await TestHelper.getApplicationFrame(developerTab)
    const iconUpload = await storePageFrame.$('#upload-icon')
    await iconUpload.uploadFile(`${global.rootPath}/test-icon.png`)
    const screenshot1Upload = await storePageFrame.$('#upload-screenshot1')
    await screenshot1Upload.uploadFile(`${global.rootPath}/test-screenshot.jpg`)
    const screenshot2Upload = await storePageFrame.$('#upload-screenshot2')
    await screenshot2Upload.uploadFile(`${global.rootPath}/test-screenshot.jpg`)
    const screenshot3Upload = await storePageFrame.$('#upload-screenshot3')
    await screenshot3Upload.uploadFile(`${global.rootPath}/test-screenshot.jpg`)
    const screenshot4Upload = await storePageFrame.$('#upload-screenshot4')
    await screenshot4Upload.uploadFile(`${global.rootPath}/test-screenshot.jpg`)
    await TestHelper.completeForm(developerTab, {
      name: 'JSON formatter',
      tag1: 'JSON',
      tag2: 'Converter',
      tag3: 'Utility',
      tag4: 'Tool',
      description: 'JSON Formatter prettifies JSON or minimizes it.  Subscriptions include unlimited access to convert as much JSON as your browser can carry.'
    })
    await TestHelper.clickPageLink(developerTab, 'Publish')
    await TestHelper.completeForm(developerTab, {})
    // customer
    const browser3 = await puppeteer.launch(TestHelper.browserConfiguration())
    const customer1Username = 'customer1-username-' + Math.floor(new Date().getTime() / 1000)
    const customer1Tab = await TestHelper.createRegistration(browser3, {
      username: customer1Username,
      password: 'customer1-password',
      confirm: 'customer1-password',
      email: 'customer@account.com',
      'first-name': 'Customer',
      'last-name': 'Account'
    })
    await TestHelper.clickPageLink(ownerTab, 'Accounts')
    await TestHelper.clickFrameLink(customer1Tab, 'JSON formatter')
    await TestHelper.clickFrameLink(customer1Tab, 'Install')
    await TestHelper.completeForm(customer1Tab, {})
    await TestHelper.clickFrameLink(customer1Tab, 'Add new profile')
    await TestHelper.completeForm(customer1Tab, {
      description: 'boe',
      email: testUserData[2].email,
      number: '4111111111111111',
      cvc: '111',
      exp_month: '1',
      exp_year: (new Date().getFullYear() + 1).toString().substring(2),
      name: `${testUserData[2].firstName} ${testUserData[2].lastName}`
    })
    const customerProfileFrame = await TestHelper.getApplicationFrame(customer1Tab)
    await customerProfileFrame.evaluate(el => el.selectedIndex = 1, await customerProfileFrame.$('#customerid'))
    await TestHelper.completeForm(customer1Tab, {})
    // customer has a subscription
    await TestHelper.clickPageLink(customer1Tab, 'Home')
    await TestHelper.clickPageLink(customer1Tab, 'Subscriptions')
    const subscriptionFrame = await TestHelper.getApplicationFrame(customer1Tab)
    const subscriptionLink = await subscriptionFrame.$x(`//a[contains(text(), 'sub_')]`)
    await subscriptionLink[0].click()
    await customer1Tab.waitFor(1000)
    const installed1Frame = await TestHelper.getApplicationFrame(customer1Tab)
    const trialStatus = await installed1Frame.$x(`//td[contains(text(), 'Active \(trial\)')]`)
    assert.strictEqual(trialStatus.length, 1)
    browser1.close()
    browser2.close()
    browser3.close()
  })
})
