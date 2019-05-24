var contentContainer, layoutContainer
var installs
var layout
var iframe
var appNumber = 0

window.addEventListener('load', function (event) {
  document.body.style.overflow = 'auto'
  document.body.style.backgroundColor = '#036'
  document.getElementById('container').style.height = 'auto'
  document.title = 'UserAppStore'
  iframe = document.getElementById('application-iframe')
  iframe.parentNode.removeChild(iframe)
  var appMenu, appLinks
  // make installs open into Golden Layout
  appMenu = document.getElementById('app-menu-container')
  installs = {}
  if (appMenu.children.length) {
    appMenu.style.display = ''
    appLinks = appMenu.getElementsByTagName('a')
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
  // make website links open content into a shared container
  var links = document.getElementsByTagName('a')
  for (i = 0, len = links.length; i < len; i++) {
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
    return openContent(event, true)
  }
})

function openContent (event, first) {
  console.log('open content', event, first)
  var newURL
  if (!first) {
    event.preventDefault()
    newURL = event.target.href.split('://')
  } else {
    newURL = [ '/home' ]
  }
  if (newURL.length === 1) {
    newURL = newURL[0]
  } else {
    newURL = newURL[1].substring(newURL[1].indexOf('/'))
  }
  console.log('new url', newURL)
  if (newURL === '/home' && !first) {
    var navigation = document.getElementById('navigation')
    navigation.innerHTML = document.getElementById('opened-install-navbar').innerHTML
    var links = navigation.getElementsByTagName('a')
    for (i = 0, len = links.length; i < len; i++) {
      if (!links[i].href ||
        links[i].href.indexOf('/account/signout') > -1 ||
        links[i].href.indexOf('/install/') > -1) {
        continue
      }
      links[i].onclick = openContent
    }
    if (contentContainer.parentNode) {
      document.body.removeChild(contentContainer)
    }
    if (layoutContainer) {
      layoutContainer.style.display = ''
    }
    return
  }
  if (first) {
    return setTimeout(createContent, 1)
  }
  console.log('fetching')
  return Request.get(newURL, function (_, response) {
    console.log('creating content')
    return createContent(response)
  })
}

function createContent (html) {
  var srcdoc, newTitle, navigation, newNavigation
  var navigation = document.getElementById('navigation')
  if (html) {
    srcdoc = html.substring(html.indexOf('srcdoc="') + 'srcdoc="'.length)
    srcdoc = srcdoc.substring(0, srcdoc.lastIndexOf('></iframe>'))
    srcdoc = srcdoc.substring(0, srcdoc.lastIndexOf('"'))
    newTitle = html.substring(html.indexOf('<title>') + '<title>'.length)
    newTitle = newTitle.substring(0, newTitle.indexOf('</title>'))
    newNavigation = html.substring(html.indexOf('<nav id="navigation">') + '<nav id="navigation">'.length)
    newNavigation = newNavigation.substring(0, newNavigation.indexOf('</nav>'))
    navigation.innerHTML = newNavigation
  } else {
    srcdoc = iframe.srcdocWas
    newTitle = document.title
  }
  var links = navigation.getElementsByTagName('a')
  for (i = 0, len = links.length; i < len; i++) {
    if (!links[i].href ||
      links[i].href.indexOf('/account/signout') > -1 ||
      links[i].href.indexOf('/install/') > -1) {
      continue
    }
    links[i].onclick = openContent
  }
  var newFrame = document.createElement('iframe')
  newFrame.className = 'application'
  newFrame.style.width = '100%'
  newFrame.style.height = '100%'
  newFrame.srcdoc = srcdoc
  newFrame.onload = function (event) {
    var links = newFrame.contentWindow.document.getElementsByTagName('a')
    for (var i = 0, len = links.length; i < len; i++) {
      if (!links[i].href ||
        links[i].href.indexOf('/account/signout') > -1 ||
        links[i].href.indexOf('/install/') > -1) {
        continue
      }
      links[i].onclick = openContent
    }
    var forms = newFrame.contentWindow.document.getElementsByTagName('form')
    for (var i = 0, len = forms.length; i < len; i++) {
      forms[i].target = '_self'
      forms[i].action = forms[i].action || ''
      forms[i].action += (forms[i].action.indexOf('?') > -1 ? '&' : '?') + 'removeTemplate=true'
      newFrame.onload = function (event) {
        var form = newFrame.contentWindow.document.getElementById('submit-form')
        if (form) {
          form.target = '_self'
        }
        var container = document.getElementById('container')
        container.style.display = ''
        if (form && form.action && form.action.indexOf('/account/authorize')) {
          container.style.display = 'none'
        }        
      }
      newFrame.contentWindow.onhashchange = function (event) {
        console.log('caught hash change', event)
      }
      newFrame.contentWindow.document.onhashchange = function (event) {
        console.log('second hash change', event)
      }
    }
  }
  console.log('resetting content container display')
  contentContainer.innerHTML = ''
  contentContainer.id = 'modifiedfasf'
  contentContainer.appendChild(newFrame)
  document.body.appendChild(contentContainer)
  if (layoutContainer) {
    layoutContainer.style.display = 'none'
  }
}

function openApplication (event, first) {
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
  console.log(newURL, installid)
  if (first) {
    return createApplicationContent(installid)
  }  
  return Request.get(newURL, function (_, response) {
    return createApplicationContent(installid, response)
  })
}

function createApplicationContent (installid, html) {
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
      console.log('tab created')
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

function closeApplication (event) {
  const link = event.target
  const container = link.container
  container.close()
}
