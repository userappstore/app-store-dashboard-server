const dashboard = require('@userdashboard/dashboard')
dashboard.start(__dirname)

if (process.env.NODE_ENV === 'testing') {
  const helperRoutes = require('@userdashboard/stripe-subscriptions/screenshot-helper-routes.js')
  global.sitemap['/fake-amount-owed'] = helperRoutes.fakeAmountOwed
  global.sitemap['/toggle-refunds'] = helperRoutes.toggleRefunds
}
