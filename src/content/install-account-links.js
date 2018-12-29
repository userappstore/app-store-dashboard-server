const applicationServer = require('../application-server.js')
const dashboard = require('@userappstore/dashboard')

module.exports = {
  page: (req, res, doc) => {
    if (req.appid === global.appid || req.urlPath.indexOf('/account/') !== 0) {
      return
    }
    // add installid to subscription and organization links
    let str = doc.toString().split('/account/subscriptions').join(`/account/${req.appid}/subscriptions`)
    str = str.split('/account/organizations').join(`/account/${req.appid}/organizations`)
    doc.child = dashboard.HTML.parse(str).child
  },
  template: async (req, res, templateDoc) => {
    if (req.appid === global.appid) {
      return
    }
    // add account menu links for the install
    const install = await applicationServer.get(`/api/user/userappstore/install?installid=${req.appid}`, req.account.accountid, req.session.sessionid)
    if (req.urlPath.indexOf('/account/') === 0 || req.urlPath.indexOf('/install/') === 0) {
      const accountMenu = templateDoc.getElementById('account-menu')
      dashboard.HTML.renderTemplate(templateDoc, install, 'install-account-menu', accountMenu)
      accountMenu.child.unshift(accountMenu.child.pop())
      let retag
      for (const li of accountMenu.child) {
        if (!li.child || !li.child.length) {
          continue
        }
        const child = li.child[0]
        if (!child || child.tag !== 'a') {
          continue
        }
        if (!child.attr || !child.attr.class || child.attr.class.indexOf('current-page') === -1) {
          continue
        }
        child.classList.remove('current-page')
        retag = child.attr.href.replace('/account/', `/account/${req.appid}/`)
      }
      if (retag) {
        for (const child of accountMenu.child) {
          if (child.tag !== 'a' || !child.attr || child.attr.href !== retag) {
            continue
          }
          child.classList.add('current-page')
        }
      }
    }
    // add installid to subscription and organization links
    const navbar = templateDoc.getElementById('navigation')
    if (!navbar.child || !navbar.child.length) {
      return
    }
    if (req.urlPath.indexOf('/account/') === 0) {
      // add installid to subscription and organization links
      for (const child of navbar.child) {
        if (!child.attr) {
          continue
        }
        if (child.attr.href === '/home') {
          child.attr.href = `/install/${req.appid}/home`
          child.child[0].text = install.text
          continue
        }
        if (!child.attr.href || (
            child.attr.href.indexOf('/account/organization') !== 0 &&
          child.attr.href.indexOf('/account/subscriptions') !== 0)) {
            continue
        }
        child.attr.href = child.attr.href.split('/account/subscriptions').join(`/account/${req.appid}/subscriptions`)
        child.attr.href = child.attr.href.split('/account/organizations').join(`/account/${req.appid}/organizations`)
      }
    }
  }
}
