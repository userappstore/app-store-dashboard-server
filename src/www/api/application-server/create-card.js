// This is largely a copy/paste it just doesn't
// lock the session to authorize creating for
// the application server to create cards
const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()
const stripeCache = require('@userappstore/stripe-subscriptions/src/stripe-cache.js')

module.exports = {
  post: async (req) => {
    if (!req.applicationServer) {
      throw new Error('invalid-access')
    }
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    const customer = await global.api.user.subscriptions.Customer._get(req)
    if (!customer) {
      throw new Error('invalid-customer')
    }
    if (!global.stripeJS) {
      if (!req.body || !req.body.name || !req.body.name.length) {
        throw new Error('invalid-name')
      }
      if (!req.body.number || !req.body.number.length) {
        throw new Error('invalid-number')
      }
      if (!req.body.cvc || req.body.cvc.length !== 3) {
        throw new Error('invalid-cvc')
      }
      try {
        const intValue = parseInt(req.body.cvc, 10)
        if (intValue.toString() !== req.body.cvc) {
          throw new Error('invalid-cvc')
        }
      } catch (error) {
        throw new Error('invalid-cvc')
      }
      if (!req.body.exp_month || !req.body.exp_month.length) {
        throw new Error('invalid-exp_month')
      }
      try {
        const intValue = parseInt(req.body.exp_month, 10)
        if (intValue.toString() !== req.body.exp_month) {
          throw new Error('invalid-exp_month')
        }
        if (intValue < 1 || intValue > 12) {
          throw new Error('invalid-exp_month')
        }
      } catch (error) {
        throw new Error('invalid-exp_month')
      }
      if (!req.body.exp_year || !req.body.exp_year.length) {
        throw new Error('invalid-exp_year')
      }
      try {
        const intValue = parseInt(req.body.exp_year, 10)
        if (intValue.toString() !== req.body.exp_year) {
          throw new Error('invalid-exp_year')
        }
        const now = new Date().getFullYear()
        if (intValue < new Date().getFullYear() || intValue > now + 10) {
          throw new Error('invalid-exp_year')
        }
      } catch (error) {
        throw new Error('invalid-exp_year')
      }
    } else if (global.stripeJS === 2 || global.stripeJS === 3) {
      if (!req.body || !req.body.token || !req.body.token.length) {
        throw new Error('invalid-token')
      }
    }
    const cardInfo = {
      metadata: {
        appid: req.appid,
        accountid: req.account.accountid
      }
    }
    if (!global.stripeJS) {
      cardInfo.source = {
        object: 'card',
        name: req.body.name,
        number: req.body.number,
        cvc: req.body.cvc,
        exp_month: req.body.exp_month,
        exp_year: req.body.exp_year
      }
      for (const field of ['address_line1', 'address_line2', 'address_city', 'address_state', 'address_zip', 'address_country']) {
        if (req.body[field] && req.body[field].length) {
          cardInfo.source[field] = req.body[field]
        }
      }
    } else if (global.stripeJS === 2 || global.stripeJS === 3) {
      cardInfo.source = req.body.token
    }
    let card
    try {
      card = await stripe.customers.createCard(req.query.customerid, cardInfo, req.stripeKey)
    } catch (error) {
      if (error.code && error.code.startsWith('invalid_')) {
        throw new Error(error.code.replace('_', '-'))
      }
      throw new Error('unknown-error')
    }
    await stripeCache.update(card, req.stripeKey)
    const customerNow = await stripe.customers.update(req.query.customerid, { default_source: card.id }, req.stripeKey)
    await stripeCache.update(customerNow, req.stripeKey)
    await dashboard.StorageList.add(`${req.appid}/cards`, card.id)
    await dashboard.StorageList.add(`${req.appid}/customer/cards/${req.query.customerid}`, card.id)
    await dashboard.StorageList.add(`${req.appid}/account/cards/${req.account.accountid}`, card.id)
    await dashboard.StorageObject.setProperty(`${req.appid}/map/cardid/customerid`, card.id, req.query.customerid)
    req.success = true
    return card
  }
}
