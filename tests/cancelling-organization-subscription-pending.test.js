/* eslint-env mocha */
const assert = require('assert')
const puppeteer = require('puppeteer')
const TestHelper = require('../test-helper-chrome.js')
const testUserData = require('@userappstore/dashboard/test-data.json')

// Test that users can cancel subscriptions for an organization
// at period end
// 
// 1) the owner account registers and idles on the accounts page
// 2) a developer account registers, creates an organization, creates 
//    a project and shares it, then publishes it to the app store 
//    after completing a Connect registration
// 3) customer one registers, creates an organization and invitation
// 4) second customer registers and uses the invitation
// 5) customer one subscribes to published app for organization 
//    paying for second customer, then cancels the subscription
//    at end of billing period
// 6) the app stays installed and accessible to both customers

describe(`tests/cancelling-organization-subscription-pending`, () => {
  it('should cancel organization subscription at period end', async () => {
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
    const registrationInformationFrame = await TestHelper.getApplicationFrame(developerTab)
    const idScanUpload = await registrationInformationFrame.$('#id_scan')
    await idScanUpload.uploadFile(`${global.rootPath}/test-documentid-success.png`)
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
    await TestHelper.clickFrameLink(developerTab, 'Setup payment information')
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
      // application_fee: '5%',
      // serverid: 'test-project',
      // stripeid: testUserData[1].firstName + ' ' + testUserData[1].lastName
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
    // customer1
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
    await customer1Tab.hover('#account-menu-container')
    await TestHelper.clickPageLink(customer1Tab, 'Manage organizations')
    await TestHelper.clickFrameLink(customer1Tab, 'Create organization')
    await TestHelper.completeForm(customer1Tab, {
      name: 'My organization',
      email: testUserData[2].email
    })
    await TestHelper.clickPageLink(customer1Tab, 'Invitations')
    await TestHelper.clickFrameLink(customer1Tab, 'Create invitation')
    await TestHelper.completeForm(customer1Tab, {
      code: 'the-invitation-code'
    })
    const invitationLinkFrame = await TestHelper.getApplicationFrame(customer1Tab)
    const invitationid = await invitationLinkFrame.$eval('.link', e => e.value)
    await TestHelper.clickPageLink(customer1Tab, 'Memberships')
    // customer2
    const browser4 = await puppeteer.launch(TestHelper.browserConfiguration())
    const customer2Username = 'customer2-username-' + Math.floor(new Date().getTime() / 1000)
    const customer2Tab = await TestHelper.createRegistration(browser4, {
      username: customer2Username,
      password: 'customer2-password',
      confirm: 'customer2-password',
      email: 'second@customer.com',
      'first-name': 'Another',
      'last-name': 'Customer'
    })
    await TestHelper.clickPageLink(ownerTab, 'Accounts')
    await customer2Tab.hover('#account-menu-container')
    await TestHelper.clickPageLink(customer2Tab, 'Manage organizations')
    await TestHelper.clickPageLink(customer2Tab, 'Accept invitation')
    await TestHelper.completeForm(customer2Tab, {
      invitationid,
      name: `${testUserData[3].firstName} ${testUserData[3].lastName}`,
      email: testUserData[3].email,
      code: 'the-invitation-code'
    })
    // customer1 installs app
    await TestHelper.clickPageLink(customer1Tab, 'Home')
    await TestHelper.clickFrameLink(customer1Tab, 'JSON formatter')
    await TestHelper.clickFrameLink(customer1Tab, 'Install')
    await customer1Tab.waitFor(1000)
    const installFrame = await TestHelper.getApplicationFrame(customer1Tab)
    await installFrame.evaluate(el => el.selectedIndex = 2, await installFrame.$('#organizations-list'))
    await TestHelper.completeForm(customer1Tab, {})
    const membersFrame = await TestHelper.getApplicationFrame(customer1Tab)
    await membersFrame.evaluate(_ => document.getElementsByTagName('input')[0].checked = true)
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
    const billingFrame = await TestHelper.getApplicationFrame(customer1Tab)
    await billingFrame.evaluate(el => el.selectedIndex = 1, await billingFrame.$('#customerid'))
    global.webhooks = []
    await TestHelper.completeForm(customer1Tab, {})
    // customer2 configures install
    await TestHelper.clickPageLink(customer2Tab, 'Home')
    await TestHelper.clickFrameLink(customer2Tab, 'Setup JSON formatter')
    await TestHelper.completeForm(customer2Tab, {})
    await TestHelper.completeForm(customer2Tab, {
      'first-name': testUserData[3].firstName,
      'last-name': testUserData[3].lastName,
      email: testUserData[3].email
    })
    // customer1 cancels the subscription
    await TestHelper.clickPageLink(customer1Tab, 'Home')
    await TestHelper.clickPageLink(customer1Tab, 'Subscriptions')
    await TestHelper.clickFrameLink(customer1Tab, 'Cancel')
    await customer1Tab.waitFor(1000)
    const cancelFrame = await TestHelper.getApplicationFrame(customer1Tab)
    await cancelFrame.evaluate(el => el.checked = true, await cancelFrame.$('#delay'))
    await TestHelper.completeForm(customer1Tab, {})
    // customer 1 retains access until the end of billing period
    await TestHelper.clickPageLink(customer1Tab, 'Home')
    await customer1Tab.waitFor(1000)
    await TestHelper.clickPageLink(customer1Tab, 'Installs')
    await customer1Tab.waitFor(1000)
    const installed1Frame = await TestHelper.getApplicationFrame(customer1Tab)
    const appLink1Exists = await installed1Frame.evaluate(() => {
      return document.body.innerHTML.indexOf('test-app-')
    })
    assert.strictEqual(appLink1Exists > -1, true)
    await TestHelper.clickPageLink(customer1Tab, 'Uninstalled')
    const uninstalled1Frame = await TestHelper.getApplicationFrame(customer1Tab)
    const appLink2Exists = await uninstalled1Frame.evaluate(() => {
      return document.body.innerHTML.indexOf('test-app-')
    })
    assert.strictEqual(appLink2Exists, -1)
    // customer 2 retains access until the end of billing period
    await TestHelper.clickPageLink(customer2Tab, 'Home')
    await customer1Tab.waitFor(1000)
    await TestHelper.clickPageLink(customer2Tab, 'Installs')
    await customer1Tab.waitFor(1000)
    const installed2Frame = await TestHelper.getApplicationFrame(customer2Tab)
    const appLink3Exists = await installed2Frame.evaluate(() => {
      return document.body.innerHTML.indexOf('test-app-')
    })
    assert.strictEqual(appLink3Exists > -1, true)
    await TestHelper.clickPageLink(customer2Tab, 'Uninstalled')
    const uninstalled2Frame = await TestHelper.getApplicationFrame(customer1Tab)
    const appLink4Exists = await uninstalled2Frame.evaluate(() => {
      return document.body.innerHTML.indexOf('test-app-')
    })
    assert.strictEqual(appLink4Exists, -1)
    browser1.close()
    browser2.close()
    browser3.close()
    browser4.close()
  })
})
