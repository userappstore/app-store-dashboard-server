/* eslint-env mocha */
// require('./test-helper.js')
const fs = require('fs')
const headless = process.env.SHOW_BROWSERS !== 'true'

let storagePath
if (!process.env.STORAGE_ENGINE) {
  storagePath = process.env.STORAGE_PATH || `${global.applicationPath}/data`
  if (!fs.existsSync(storagePath)) {
    createFolderSync(storagePath)
  }
}

global.rootPath = __dirname

// for deleting the application server's test data between tests too
const storagePath2 = storagePath.replace('data1', 'data2')

module.exports = {
  awaitFrameElement,
  awaitPageElement,
  createRegistration,
  getApplicationFrame,
  hoverItem,
  completeForm,
  clickFrameLink,
  clickPageLink,
  browserConfiguration: () => {
    let position
    switch (global.openBrowsers) {
      case 0:
        position = '558,155'
        break
      case 1:
        position = '2098,155'
        break
      case 2:
        position = '558,1105'
        break
      case 3:
        position = '2098,1105'
        break
    }
    global.openBrowsers++
    return {
      headless,
      args: ['--window-size=1440,900', `--window-position=${position}`, '--incognito'],
      slowMo: 0
    }
  }
}

beforeEach(() => {
  deleteLocalData(storagePath)
  fs.mkdirSync(storagePath)
  deleteLocalData(storagePath2)
  fs.mkdirSync(storagePath2)
  global.openBrowsers = 0
})


async function getApplicationFrame(browserTab) {
  await browserTab.waitFor(100)
  let frame
  while (!frame) {
    try {
      frame = await browserTab.frames().find(f => f.name() === 'application-iframe')
      if (!frame) {
        await browserTab.waitFor(100)
      }
    } catch (error) {
    }
  }
  return frame
}

async function awaitFrameElement(browserTab, id) {
  await browserTab.waitFor(100)
  let element
  while (!element) {
    browserTab.waitFor(100)
    try {
      const frame = await getApplicationFrame(browserTab)
      element = await frame.$(id)
    } catch (error) {
    }
  }
  return element
}

async function awaitPageElement(browserTab, id) {
  await browserTab.waitFor(100)
  let element
  while (!element) {
    await browserTab.waitFor(100)
    try {
      element = await browserTab.$(id)
    } catch (error) {
    }
  }
  return element
}

async function createRegistration (browser, userInfo) {
  const pages = await browser.pages()
  const tab = pages[0]
  await tab.setViewport({ width: 1440, height: 900 })
  await tab.goto(process.env.DASHBOARD_SERVER, { waitLoad: true, waitNetworkIdle: true })
  await tab.waitForSelector('body')
  await clickPageLink(tab, 'Register')
  await completeForm(tab, userInfo)
  return tab
}

async function hoverItem (browserTab, element) {
  await browserTab.waitForSelector(`#${element}`)
  await browserTab.hover(`#${element}`)
  await browserTab.waitFor(400)
}

async function completeForm(browserTab, body, submitButton) {
  await browserTab.waitFor(100)
  if (process.env.DEBUG_ERRORS) {
    console.log('submit', body)
  }
  const bodyWas = await browserTab.evaluate(() => {
    return document.body.innerHTML
  })
  let active
  for (const field in body) {
    await browserTab.waitFor(100)
    let element
    while (!element) {
      await browserTab.waitFor(100)
      try {
        frame = await browserTab.frames().find(f => f.name() === 'application-iframe')
        active = frame || browserTab
        if (!active.evaluate) {
          continue
        }
        element = await active.$(`#${field}`)
        if (!element) {
          continue
        }
        await element.hover()
        await browserTab.waitFor(100)
        await element.click()
        await browserTab.waitFor(100)
        if (body[field]) {
          active.evaluate((data) => {
            return document.getElementById(data.field).value = ''
          }, { field })
        }
        await element.type(body[field], { delay: 10 })
        } catch (error) {
      }
    }
  }
  if (active !== browserTab) {
    button = await awaitFrameElement(browserTab, submitButton || '#submit-button')
  } else {
    button = await awaitPageElement(browserTab, submitButton || '#submit-button')
  }
  await button.click()
  return completeRequest(browserTab, bodyWas)
}

async function clickPageLink(browserTab, text) {
  await browserTab.waitFor(100)
  if (process.env.DEBUG_ERRORS) {
    console.log('page', text)
  }
  let bodyWas = await browserTab.evaluate(() => {
    return document.body.innerHTML
  })
  let links
  while (!links || !links.length) {
    await browserTab.waitFor(100)
    try {
      links = await browserTab.$x(`//a[contains(text(), '${text}')]`)
    } catch (error) {
    }
  }
  const link = links[0]
  await link.click()
  return completeRequest(browserTab, bodyWas)
}

async function clickFrameLink(browserTab, text) {
  await browserTab.waitFor(100)
  if (process.env.DEBUG_ERRORS) {
    console.log('frame', text)
  }
  let bodyWas = await browserTab.evaluate(() => {
    return document.body.innerHTML
  })
  let frame, links
  while (!links || !links.length) {
    await browserTab.waitFor(100)
    try {
      frame = await getApplicationFrame(browserTab)
      links = await frame.$x(`//a[contains(text(), '${text}')]`)
    } catch (error) {
    }
  }
  const link = links[0]
  await link.click()
  return completeRequest(browserTab, bodyWas)
}

async function completeRequest (browserTab, previousContents) {
  await browserTab.waitFor(100)
  while (true) {
    await browserTab.waitFor(100)
    try {
      const bodyNow = await browserTab.evaluate(() => {
        return document.body.innerHTML
      })
      if (!bodyNow || bodyNow === previousContents) {
        continue
      }
      if (bodyNow.indexOf('Redirecting') > -1) {
        previousContents = bodyNow
        continue
      }
      return
    } catch (error) {
    }
  }
}

function deleteLocalData(currentPath) {
  if (!fs.existsSync(currentPath)) {
    return
  }
  const contents = fs.readdirSync(currentPath)
  for (const item of contents) {
    var itemPath = `${currentPath}/${item}`
    const stat = fs.lstatSync(itemPath)
    if (stat.isDirectory()) {
      deleteLocalData(itemPath)
    } else {
      fs.unlinkSync(itemPath)
    }
  }
  fs.rmdirSync(currentPath)
}

function createFolderSync (path) {
  const nested = path.substring(storagePath.length + 1)
  const nestedParts = nested.split('/')
  let nestedPath = storagePath
  for (const part of nestedParts) {
    nestedPath += `/${part}`
    if (!fs.existsSync(nestedPath)) {
      fs.mkdirSync(nestedPath)
    }
  }
}
