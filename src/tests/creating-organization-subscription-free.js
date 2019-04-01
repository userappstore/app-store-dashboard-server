/* eslint-env mocha */
const assert = require('assert')
const puppeteer = require('puppeteer')
const TestHelperBrowser = require('../../test-helper-browser.js')
const testUserData = require('@userappstore/dashboard/test-data.json')
const headless = process.env.SHOW_BROWSERS !== 'true'

const projectHTML = `<html>
  <head>
    <title>JSON.parse</title>
    <link rel="stylesheet" href="/public/app.css" />
    <script src="/public/app.js" />
  </head>
  <body>
    <textarea id="json" placeholder="Paste your JSON here"></textarea>
    <button id="max">Friendly</button>
    <button id="min">Minimized</button>
  </body>
</html>`
const projectJS = `window.onload = (e) => {
  const json = document.getElementById('json')
  const min = document.getElementById('min')
  min.onclick = (e) => {
    e.preventDefault()
    json.innerHTML = JSON.parse(JSON.stringify(json.innerHTML))
  }
  max.onclick = (e) => {
    e.preventDefault()
    json.innerHTML = JSON.parse(JSON.stringify(json.innerHTML), null, '\t')
  }
}`
const projectCSS = `textarea { display: block; padding: 1rem; background-color: #EEE; border: 1px solid #666 }`

describe(`tests/creating-subscription-for-organization-member`, () => {
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
      projectid: 'test-project'
    })
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developerTab, 'Share')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(developerTab, {})
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developerTab, 'Project IDE')
    const projectIDEFrame = await developerTab.frames().find(f => f.name() === 'application-iframe')
    await projectIDEFrame.waitForSelector('.ace_text-input')
    await projectIDEFrame.evaluate('switchEditor({ target: { id: "home.html-link" } })')
    await developerTab.waitFor(400)
    await projectIDEFrame.evaluate(`editors["home.html"].setValue(\`${projectHTML}\`)`)
    await developerTab.waitFor(400)
    await projectIDEFrame.evaluate('switchEditor({ target: { id: "app.js-link" } })')
    await developerTab.waitFor(400)
    await projectIDEFrame.evaluate(`editors["app.js"].setValue(\`${projectJS}\`)`)
    await developerTab.waitFor(400)
    await projectIDEFrame.evaluate('switchEditor({ target: { id: "app.css-link" } })')
    await developerTab.waitFor(400)
    await projectIDEFrame.evaluate(`editors["app.css"].setValue(\`${projectCSS}\`)`)
    await developerTab.waitFor(400)
    await projectIDEFrame.evaluate('saveChangedFiles()')
    await developerTab.waitFor(400)
    await developerTab.reload({ waitLoad: true, waitNetworkIdle: true })
    await developerTab.waitFor(400)
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
    await TestHelperBrowser.clickPageLink(developerTab, 'pps')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(developerTab, `test-app-${global.testNumber}`)
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(developerTab, 'Store page')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    // preset the icon, screenshot1, screenshot2, screenshot3, screenshot4
    const storePageFrame = await developerTab.frames().find(f => f.name() === 'application-iframe')
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
    // create the first customer and customer1
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
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await customer1Tab.hover('#account-menu-container')
    await customer1Tab.waitFor(400)
    await TestHelperBrowser.clickPageLink(customer1Tab, 'Manage organizations')
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(customer1Tab, 'Create organization')
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(customer1Tab, {
      name: 'My organization',
      email: testUserData[2].email
    })
    await customer1Tab.waitForSelector('#submit-form', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(customer1Tab, {
      username: 'customer1-username',
      password: 'customer1-password',
      'remember-minutes': ''
    })
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(customer1Tab, 'Invitations')
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(customer1Tab, 'Create invitation')
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(customer1Tab, {
      code: 'the-invitation-code'
    })
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    const invitationLinkFrame = await customer1Tab.frames().find(f => f.name() === 'application-iframe')
    const invitationid = await invitationLinkFrame.$eval('.link', e => e.value)
    await TestHelperBrowser.clickPageLink(customer1Tab, 'Memberships')
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    // create the second customer with customer2ship    
    const browser4 = await puppeteer.launch({
      headless,
      args: ['--window-size=1440,900', '--window-position=2098,1105', '--incognito'],
        slowMo: 0
    })
    const browser4Pages = await browser4.pages()
    const customer2Tab = browser4Pages[0]
    await customer2Tab.setViewport({ width: 1440, height: 900 })
    await customer2Tab.goto(global.dashboardServer, { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(customer2Tab, {
      username: 'customer2-username',
      password: 'customer2-password',
      confirm: 'customer2-password'
    })
    await ownerTab.reload()
    await customer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await customer2Tab.hover('#account-menu-container')
    await customer2Tab.waitFor(400)
    await TestHelperBrowser.clickPageLink(customer2Tab, 'Manage organizations')
    await customer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickPageLink(customer2Tab, 'Accept invitation')
    await customer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(customer2Tab, {
      invitationid,
      name: `${testUserData[3].firstName} ${testUserData[3].lastName}`,
      email: testUserData[3].email,
      code: 'the-invitation-code'
    })
    await customer2Tab.waitForSelector('#submit-form')
    await TestHelperBrowser.completeForm(customer2Tab, {
      username: 'customer2-username',
      password: 'customer2-password',
      'remember-minutes': ''
    })
    await customer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    // customer 1 installs the app for the organization
    await TestHelperBrowser.clickPageLink(customer1Tab, 'Home')
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(customer1Tab, 'JSON formatter')
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(customer1Tab, 'Install')
    await customer1Tab.waitFor(400)
    await customer1Tab.waitForSelector('#submit-form', { waitLoad: true, waitNetworkIdle: true })
    await customer1Tab.evaluate(el => el.selectedIndex = 2, await customer1Tab.$('#organizations-list'))
    await TestHelperBrowser.completeForm(customer1Tab, {})
    await customer1Tab.waitFor(400)
    await customer1Tab.waitForSelector('#submit-form', { waitLoad: true, waitNetworkIdle: true })
    await customer1Tab.evaluate(_ => document.getElementsByTagName('input')[0].checked = true)
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
      exp_year: (new Date().getFullYear() + 1).toString(),
      name: `${testUserData[2].firstName} ${testUserData[2].lastName}`
    })
    await customer1Tab.waitForSelector('#customerid', { waitLoad: true, waitNetworkIdle: true })
    await customer1Tab.evaluate(el => el.selectedIndex = 1, await customer1Tab.$('#customerid'))
    await TestHelperBrowser.completeForm(customer1Tab, {})
    await customer1Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    // customer2 configures install
    await TestHelperBrowser.clickPageLink(customer2Tab, 'Home')
    await customer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.clickFrameLink(customer2Tab, 'Install')
    await customer2Tab.waitForSelector('#submit-form', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(customer2Tab, {})
    await customer2Tab.waitForSelector('#submit-form', { waitLoad: true, waitNetworkIdle: true })
    await TestHelperBrowser.completeForm(customer2Tab, {
      'first-name': testUserData[3].firstName,
      'last-name': testUserData[3].lastName,
      email: testUserData[3].email
    })
    await customer2Tab.waitForSelector('#application-iframe')
    const applicationFrame = await customer2Tab.frames().find(f => f.name() === 'application-iframe')
    await applicationFrame.waitForSelector('#json')
    const projectElement = await applicationFrame.$('#json')
    assert.notStrictEqual(projectElement, undefined)
    assert.notStrictEqual(projectElement, null)
    browser1.close()
    browser2.close()
    browser3.close()
    browser4.close()
  })
})
