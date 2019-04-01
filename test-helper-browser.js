module.exports = {
  completeForm,
  clickFrameLink,
  clickPageLink
}

async function completeForm(page, body, submitButton) {
  console.log('submit', body)
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
  await active.focus(submitButton || '#submit-button')
  await active.waitFor(400)
  await active.click(submitButton || '#submit-button', { waitLoad: true, waitNetworkIdle: true })
  await page.waitForSelector('body', { waitLoad: true, waitNetworkIdle: true })
  const meta = await page.$('meta[type=refresh]')
  if (meta) {
    await page.waitFor(1100)
    await page.waitForSelector('body', { waitLoad: true, waitNetworkIdle: true })
  }
}

async function clickPageLink(page, text) {
  console.log('page', text)
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
  console.log('frame', text)
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