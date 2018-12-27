const dashboard = require('@userappstore/dashboard')

module.exports = {
  after: afterAuthentication
}

async function afterAuthentication (req) {
  if (!req.account || req.app === 'app' || req.urlPath === `/api/user/${req.appid}/subscriptions/create-customer`) {
    return
  }
  const customerids = await dashboard.StorageList.list(`${req.appid}:account:customers:${req.account.accountid}`, 0, 1)
  let customerid = customerids && customerids.length ? customerids[0] : null
  const queryWas = req.query
  if (customerid) {
    req.query = { customerid }
    req.customer = await global.api.user.subscriptions.Customer.get(req)
    req.query = queryWas
  }
}
