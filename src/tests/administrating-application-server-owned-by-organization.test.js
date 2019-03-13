/* eslint-env mocha */
const assert = require('assert')
const puppeteer = require('puppeteer')
const testUserData = require('@userappstore/dashboard/test-data.json')

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

async function completeForm(page, body) {
  await page.waitForSelector('body', { waitLoad: true, waitNetworkIdle: true })
  let frame
  if (page.frames) {
    frame = await page.frames().find(f => f.name() === 'application-iframe')
  }
  const active = frame || page
  for (const field in body) {
    const element = await active.$(`#${field}`)
    await element.focus()
    await active.waitFor(200)
    await element.click()
    await active.waitFor(200)
    if (body[field]) {
      active.evaluate((data) => { return document.getElementById(data.field).value = '' }, { field })
    }
    await element.type(body[field], { delay: 10 })
    await active.waitFor(200)
  }
  await active.waitFor(400)
  await active.focus('#submit-button')
  await active.waitFor(400)
  await active.click('#submit-button', { waitLoad: true, waitNetworkIdle: true })
  await page.waitForSelector('body', { waitLoad: true, waitNetworkIdle: true })
  const meta = await page.$('meta[type=refresh]')
  if (meta) {
    await page.waitFor(1100)
    await page.waitForSelector('body', { waitLoad: true, waitNetworkIdle: true })
  }
}

async function clickPageLink(page, text) {
  await page.waitForSelector('body', { waitLoad: true, waitNetworkIdle: true })
  let links = await page.$x(`//a[contains(text(), '${text}')]`)
  while (!links || !links.length) {
    await page.waitFor(100)
    links = await page.$x(`//a[contains(text(), '${text}')]`)
  }
  const link = links[0]
  await page.waitFor(400)
  await link.focus()
  await page.waitFor(400)
  await link.click({ waitLoad: true, waitNetworkIdle: true })
  await page.waitForSelector('body', { waitLoad: true, waitNetworkIdle: true })
  const meta = await page.$('meta[type=refresh]')
  if (meta) {
    await page.waitFor(1100)
    await page.waitForSelector('body', { waitLoad: true, waitNetworkIdle: true })
  }
}

async function clickFrameLink(page, text) {
  await page.waitForSelector('iframe', { waitLoad: true, waitNetworkIdle: true })
  let frame = await page.frames().find(f => f.name() === 'application-iframe')
  if (!frame) {
    await page.waitFor(100)
    frame = await page.frames().find(f => f.name() === 'application-iframe')
  }
  let links = await frame.$x(`//a[contains(text(), '${text}')]`)
  while (!links || !links.length) {
    await page.waitFor(100)
    links = await frame.$x(`//a[contains(text(), '${text}')]`)
  }
  const link = links[0]
  await page.waitFor(400)
  await link.focus()
  await page.waitFor(200)
  await link.click({ waitLoad: true, waitNetworkIdle: true })
  await page.waitForSelector('body', { waitLoad: true, waitNetworkIdle: true })
  const meta = await page.$('meta[type=refresh]')
  if (meta) {
    await page.waitFor(1100)
    await page.waitForSelector('body', { waitLoad: true, waitNetworkIdle: true })
  }
}

describe(`tests/administrating-application-server-owned-by-organization`, () => {
  it('should work via UI browsing', async () => {
    global.pageSize = 40
    // create owner account
    const browser1 = await puppeteer.launch({
      headless: false,
      args: ['--window-size=1440,900', '--window-position=558,155', '--incognito'],
      slowMo: 0
    })
    const ownerPages = await browser1.pages()
    const ownerTab = ownerPages[0]
    await ownerTab.setViewport({ width: 1440, height: 900 })
    await ownerTab.goto(global.dashboardServer, { waitLoad: true, waitNetworkIdle: true })
    await ownerTab.waitForSelector('body')
    await completeForm(ownerTab, {
      username: 'owner-username',
      password: 'owner-password',
      confirm: 'owner-password'
    })
    await ownerTab.waitForSelector('#application-iframe')
    await ownerTab.hover('#administrator-menu-container')
    await ownerTab.waitFor(400)
    await clickPageLink(ownerTab, 'Dashboard administration')
    await ownerTab.waitForSelector('#application-iframe')
    await clickPageLink(ownerTab, 'Accounts')
    await ownerTab.waitForSelector('#application-iframe')
    // create developer account
    const browser2 = await puppeteer.launch({
      headless: false,
      args: ['--window-size=1440,900', '--window-position=2098,155', '--incognito'],
      slowMo: 0
    })
    let developerPages = await browser2.pages()
    let developerTab = developerPages[0]
    await developerTab.setViewport({ width: 1440, height: 900 })
    await developerTab.goto(global.dashboardServer, { waitLoad: true, waitNetworkIdle: true })
    await completeForm(developerTab, {
      username: 'developer-username',
      password: 'developer-password',
      confirm: 'developer-password'
    })
    await ownerTab.reload()
    // create organization and invitation
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await developerTab.hover('#account-menu-container')
    await developerTab.waitFor(400)
    await clickPageLink(developerTab, 'Manage organizations')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await clickFrameLink(developerTab, 'Create organization')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await completeForm(developerTab, {
      name: 'My organization',
      email: testUserData[2].email
    })
    await developerTab.waitForSelector('#submit-form', { waitLoad: true, waitNetworkIdle: true })
    await completeForm(developerTab, {
      username: 'developer-username',
      password: 'developer-password',
      'remember-minutes': ''
    })
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await clickPageLink(developerTab, 'Invitations')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await clickFrameLink(developerTab, 'Create invitation')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await completeForm(developerTab, {
      code: 'the-invitation-code'
    })
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    const invitationLinkFrame = await developerTab.frames().find(f => f.name() === 'application-iframe')
    const invitationid = await invitationLinkFrame.$eval('.link', e => e.value)
    await clickPageLink(developerTab, 'Home')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    // developer shares the project
    await clickPageLink(developerTab, 'Projects')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await clickFrameLink(developerTab, 'Create project')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await completeForm(developerTab, {
      projectid: 'test-project'
    })
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await clickPageLink(developerTab, 'Share')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await completeForm(developerTab, {
      organizationid: 'My organization'
    })
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await clickPageLink(developerTab, 'Project IDE')
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
    await clickPageLink(developerTab, 'Home')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await clickPageLink(developerTab, 'Application servers')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await clickFrameLink(developerTab, 'Administration')
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await completeForm(developerTab, {
      email: testUserData[1].email,
      'first-name': testUserData[1].firstName,
      'last-name': testUserData[1].lastName,
    })
    await developerTab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    // create the second developer and organization member
    const browser3 = await puppeteer.launch({
      headless: false,
      args: ['--window-size=1440,900', '--window-position=2098,1105', '--incognito'],
      slowMo: 0
    })
    const browser3Pages = await browser3.pages()
    const developer2Tab = browser3Pages[0]
    await developer2Tab.setViewport({ width: 1440, height: 900 })
    await developer2Tab.goto(global.dashboardServer, { waitLoad: true, waitNetworkIdle: true })
    await completeForm(developer2Tab, {
      username: 'developer2-username',
      password: 'developer2-password',
      confirm: 'developer2-password'
    })
    await ownerTab.reload()
    await developer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await developer2Tab.hover('#account-menu-container')
    await developer2Tab.waitFor(400)
    await clickPageLink(developer2Tab, 'Manage organizations')
    await developer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await clickPageLink(developer2Tab, 'Accept invitation')
    await developer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await completeForm(developer2Tab, {
      invitationid,
      name: `${testUserData[3].firstName} ${testUserData[3].lastName}`,
      email: testUserData[3].email,
      code: 'the-invitation-code'
    })
    await developer2Tab.waitForSelector('#submit-form')
    await completeForm(developer2Tab, {
      username: 'developer2-username',
      password: 'developer2-password',
      'remember-minutes': ''
    })
    await developer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await clickPageLink(developer2Tab, 'Home')
    await developer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await clickPageLink(developer2Tab, 'Application servers')
    await developer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await clickFrameLink(developer2Tab, 'Administration')
    await developer2Tab.waitForSelector('#application-iframe', { waitLoad: true, waitNetworkIdle: true })
    await completeForm(developer2Tab, {
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
