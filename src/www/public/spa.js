var contentContainer, layoutContainer, authorizationForm
var installs
var layout
var iframe
var appNumber = 0

window.addEventListener('load', function (event) {
  // adjust the formatting to work with golden layout
  document.body.style.overflow = 'auto'
  document.body.style.backgroundColor = '#036'
  document.getElementById('container').style.height = 'auto'
  document.title = 'UserAppStore'
  iframe = document.getElementById('application-iframe')
  iframe.parentNode.removeChild(iframe)
  // scan installed app menu and set up golden layout
  // and AJAX hooks
  var appMenu = document.getElementById('app-menu-container')
  installs = {}
  if (appMenu.children.length) {
    appMenu.style.display = ''
    var appLinks = appMenu.getElementsByTagName('a')
    for (var i = 0, len = appLinks.length; i < len; i++) {
      if (appLinks[i].href && appLinks[i].href.indexOf('/install/') > -1) {
        appLinks[i].onclick = openApplication
        appLinks[i].iframe = iframe
        var installid = appLinks[i].getAttribute('data-installid')
        installs[installid] = {
          organizationsEnabled: appLinks[i].getAttribute('data-organizations') === 'true',
          subscriptionsEnabled: appLinks[i].getAttribute('data-subscriptions') === 'true'
        }
      }
    }
  }
  // set up ajax intercepts on links
  var links = document.getElementsByTagName('a')
  for (var i = 0, len = links.length; i < len; i++) {
    if (!links[i].href ||
      links[i].href.indexOf('/account/signout') > -1 ||
      links[i].href.indexOf('/install/') > -1) {
      continue
    }
    links[i].onclick = openContent
  }
  // create containers for content and installs
  var temp = new GoldenLayout({
    content: [{
      type: 'row',
      content: []
    }]
  })
  temp.init()
  var tempContainer = document.body.lastChild
  contentContainer = document.createElement('div')
  contentContainer.id = 'content-container'
  contentContainer.style.width = tempContainer.style.width
  contentContainer.style.height = tempContainer.style.height
  contentContainer.style.backgroundColor = '#FFF'
  tempContainer.parentNode.removeChild(tempContainer)
  temp.destroy()
  document.body.style.overflow = ''
  var installIndex = window.location.pathname.indexOf('/install/')
  if (installIndex > -1) {
    return openApplication(null, true)
  } else {
    return setTimeout(createContent, 1)
  }
})

function openContent(event) {
  event.preventDefault()
  var newURL = (event.target.parentNode.href || event.target.href).split('://')
  if (newURL.length === 1) {
    newURL = newURL[0]
  } else {
    newURL = newURL[1].substring(newURL[1].indexOf('/'))
  }
  return Request.get(newURL, function (_, response) {
    return createContent(response, newURL)
  })
}

function frameContent (url) {
  var newFrame = document.createElement('iframe')
  newFrame.name = 'application-iframe'
  newFrame.className = 'application'
  newFrame.style.width = '100%'
  newFrame.style.height = '100%'
  newFrame.src = url
  newFrame.onload = function () {
    // make forms submit with ajax
    var forms = newFrame.contentWindow.document.getElementsByTagName('form')
    if (forms && forms.length) {
      for (i = 0, len = forms.length; i < len; i++) {
        forms[i].onsubmit = submitContentForm
      }
    }
    var buttons = newFrame.contentWindow.document.getElementsByTagName('button')
    if (buttons && buttons.length) {
      for (i = 0, len = buttons.length; i < len; i++) {
        if (buttons[i].type === 'submit') {
          buttons[i].onclick = submitContentForm
        }
      }
    }
    var container = document.getElementById('container')
    container.style.display = ''
    // setup ajax intercepts on page links
    var links = newFrame.contentWindow.document.getElementsByTagName('a')
    for (i = 0, len = links.length; i < len; i++) {
      if (!links[i].href ||
        links[i].href.indexOf('/account/signout') > -1 ||
        links[i].href.indexOf('/install/') > -1) {
        continue
      }
      links[i].onclick = links[i].onclick || openContent
    }
  }
  contentContainer.innerHTML = ''
  contentContainer.appendChild(newFrame)
  document.body.appendChild(contentContainer)
  if (layoutContainer) {
    layoutContainer.style.display = 'none'
  }
}

function createContent(html, url) {
  if (url && (url.indexOf('/install-app?') > -1 || url.indexOf('/confirm-subscription?') > -1 || url.indexOf('/account/subscriptions/create-billing-profile?') > -1)) {
    return frameContent(url)
  }
  var srcdoc, newTitle, navigation, newNavigation
  var navigation = document.getElementById('navigation')
  if (html) {
    // framed content
    var srcdocIndex = html.indexOf('srcdoc="')
    if (srcdocIndex > -1) {
      srcdoc = html.substring(srcdocIndex + 'srcdoc="'.length)
      srcdoc = srcdoc.substring(0, srcdoc.lastIndexOf('></iframe>'))
      srcdoc = srcdoc.substring(0, srcdoc.lastIndexOf('"'))
      newTitle = html.substring(html.indexOf('<title>') + '<title>'.length)
      newTitle = newTitle.substring(0, newTitle.indexOf('</title>'))
      var navigationIndex = html.indexOf('<nav id="navigation">')
      if (navigationIndex > -1) {
        newNavigation = html.substring(navigationIndex + '<nav id="navigation">'.length)
        newNavigation = newNavigation.substring(0, newNavigation.indexOf('</nav>'))
        navigation.innerHTML = newNavigation
      }
    } else {
      // unframed content
      navigation.innerHTML = ''
      srcdoc = html
    }
  } else {
    srcdoc = iframe.srcdocWas
    newTitle = document.title
  }
  // set up ajax intercepts on the navigation links
  var links = navigation.getElementsByTagName('a')
  for (var i = 0, len = links.length; i < len; i++) {
    if (!links[i].href ||
      links[i].href.indexOf('/account/signout') > -1 ||
      links[i].href.indexOf('/install/') > -1) {
      continue
    }
    links[i].onclick = links[i].onclick || openContent
  }
  var newFrame = document.createElement('iframe')
  newFrame.name = 'application-iframe'
  newFrame.className = 'application'
  newFrame.style.width = '100%'
  newFrame.style.height = '100%'
  newFrame.srcdoc = srcdoc
  newFrame.onload = function () {
    // make forms submit with ajax
    if (url && url.indexOf('/project-ide') === -1) {
      var forms = newFrame.contentWindow.document.getElementsByTagName('form')
      if (forms && forms.length) {
        for (i = 0, len = forms.length; i < len; i++) {
          forms[i].onsubmit = submitContentForm
        }
      }
      var buttons = newFrame.contentWindow.document.getElementsByTagName('button')
      if (buttons && buttons.length) {
        for (i = 0, len = buttons.length; i < len; i++) {
          if (buttons[i].type === 'submit') {
            buttons[i].onclick = submitContentForm
          }
        }
      }
      var container = document.getElementById('container')
      container.style.display = ''
      // setup ajax intercepts on page links
      var links = newFrame.contentWindow.document.getElementsByTagName('a')
      for (i = 0, len = links.length; i < len; i++) {
        if (!links[i].href ||
          links[i].href.indexOf('/account/signout') > -1 ||
          links[i].href.indexOf('/install/') > -1) {
          continue
        }
        links[i].onclick = links[i].onclick || openContent
      }
    }
  }
  contentContainer.innerHTML = ''
  contentContainer.appendChild(newFrame)
  document.body.appendChild(contentContainer)
  if (layoutContainer) {
    layoutContainer.style.display = 'none'
  }
}

function submitContentForm(event) {
  event.preventDefault()
  var form = event.target
  while (form.tagName !== 'FORM') {
    form = form.parentNode
  }
  var formData = new FormData(form)
  if (event.target.tagName === 'BUTTON' &&
    event.target.name &&
    event.target.value) {
    formData.append(event.target.name, event.target.value)
  }
  var currentURL = form.action
  return Request.post(currentURL, formData, function (error, response) {
    if (error) {

    }
    if (!response) {

    }
    iframe.srcdocWas = null
    function handleResponse(response) {
      if (response.indexOf('http-equiv="refresh"') === -1) {
        return createContent(response, currentURL)
      }
      var redirectURL = response.substring(response.indexOf(';url=') + ';url='.length)
      redirectURL = redirectURL.substring(0, redirectURL.indexOf('"'))
      currentURL = redirectURL
      if (redirectURL === '/account/authorize') {
        if (authorizationForm) {
          iframe.srcdocWas = authorizationForm
          return createContent(null, redirectURL)
        }
        return Request.get(currentURL, function (error, response) {
          iframe.srcdocWas = authorizationForm = response
          return createContent(null, currentURL)
        })
      } else {
        return Request.get(currentURL, function (error, response) {
          return handleResponse(response)
        })
      }
    }
    return handleResponse(response)
  })
}

function openApplication(event, first) {
  var newURL
  if (!first) {
    event.preventDefault()
    var newURL = event.target.href.split('://')
    if (newURL.length === 1) {
      newURL = newURL[0]
    } else {
      newURL = newURL[1].substring(newURL[1].indexOf('/'))
    }
  } else {
    newURL = document.location.pathname
  }
  var installid = newURL.split('/')[2]
  if (first) {
    return createApplicationContent(installid)
  }
  return Request.get(newURL, function (_, response) {
    return createApplicationContent(installid, response)
  })
}

function createApplicationContent(installid, html) {
  var srcdoc, newTitle
  if (html) {
    srcdoc = html.substring(html.indexOf('srcdoc="') + 'srcdoc="'.length)
    srcdoc = srcdoc.substring(0, srcdoc.lastIndexOf('></iframe>'))
    srcdoc = srcdoc.substring(0, srcdoc.lastIndexOf('"'))
    newTitle = html.substring(html.indexOf('<title>') + '<title>'.length)
    newTitle = newTitle.substring(0, newTitle.indexOf('</title>'))
  } else {
    srcdoc = iframe.srcdocWas
    newTitle = document.title
  }
  var newFrame = document.createElement('iframe')
  newFrame.sandbox = iframe.sandbox
  newFrame.className = iframe.className
  newFrame.srcdoc = srcdoc
  appNumber++
  if (layout && !layout.root.contentItems.length) {
    layout.destroy()
    layout = null
  }
  if (!layout) {
    layout = new GoldenLayout({
      content: [{
        type: 'row',
        content: [{
          type: 'stack',
          content: [{
            type: 'component',
            title: newTitle,
            componentName: 'app-' + appNumber
          }]
        }]
      }]
    })
  }
  layout.registerComponent('app-' + appNumber, function (container) {
    var containerElement = container.getElement()
    containerElement.append(newFrame)
    newFrame.style.width = '100%'
    newFrame.style.height = '100%'
    container.on('tab', function (tab) {
      var newMenu = document.createElement('div')
      var settingsSVG = document.getElementById('settings-svg').innerHTML
      var installMenu = document.getElementById('install-account-menu').innerHTML
      installMenu = installMenu.split('${install.installid}').join(installid)
      newMenu.innerHTML = settingsSVG
      var newMenuContainer = document.createElement('menu')
      newMenuContainer.innerHTML = installMenu
      newMenu.appendChild(newMenuContainer)
      newMenu.className = 'app-settings-menu'
      tab.element.append(newMenu)
      if (layoutContainer) {
        layoutContainer.style.display = ''
      }
      if (contentContainer.parentNode) {
        document.body.removeChild(contentContainer)
      }
      return setTimeout(function () {
        var install = installs[installid]
        if (!install.organizationsEnabled) {
          var organizationsLink = document.getElementById('organizations-link-' + installid)
          organizationsLink.parentNode.removeChild(organizationsLink)
        }
        if (!install.subscriptionsEnabled) {
          var subscriptionsLink = document.getElementById('subscriptions-link-' + installid)
          subscriptionsLink.parentNode.removeChild(subscriptionsLink)
        }
        var closeLink = document.getElementById('close-link-' + installid)
        closeLink.container = container
        closeLink.onclick = closeApplication
      }, 10)
    })
  })
  if (!layout.isInitialised) {
    layout.init()
    layoutContainer = document.querySelector('.lm_goldenlayout')
  } else {
    layout.root.contentItems[0].addChild({
      type: 'component',
      componentName: 'app-' + appNumber,
      title: newTitle
    })
  }
}

function closeApplication(event) {
  const link = event.target
  const container = link.container
  container.close()
}
