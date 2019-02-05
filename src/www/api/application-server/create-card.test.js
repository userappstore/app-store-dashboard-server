/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const SubscriptionsTestHelper = require('@userappstore/stripe-subscriptions/test-helper.js')

describe(`/api/application-server/create-card`, () => {
  describe('CreateCard#BEFORE', () => {
    it('should restrict access to application server', async () => {
      const owner = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/application-server/create-card?customerid=xxx`)
      req.account = owner.account
      req.session = owner.session
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-access')
    })

    it('should require name for no Stripe JS', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      await SubscriptionsTestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/application-server/create-card?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        email: user.profile.email,
        description: 'description',
        name: null,
        cvc: '111',
        number: '4111111111111111',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString()
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-name')
    })

    it('should require CVC for no Stripe JS', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      await SubscriptionsTestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/application-server/create-card?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        email: user.profile.email,
        description: 'description',
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        cvc: '0',
        number: '4111111111111111',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString()
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-cvc')
    })

    it('should require card number for no Stripe JS', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      await SubscriptionsTestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/application-server/create-card?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        email: user.profile.email,
        description: 'description',
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        cvc: '123',
        number: null,
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString()
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-number')
    })

    it('should require expiration month for no Stripe JS', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      await SubscriptionsTestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/application-server/create-card?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        email: user.profile.email,
        description: 'description',
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        cvc: '123',
        number: '4111111111111111',
        exp_month: null,
        exp_year: (new Date().getFullYear() + 1).toString()
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-exp_month')
    })

    it('should require expiration year for no Stripe JS', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      await SubscriptionsTestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/application-server/create-card?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        email: user.profile.email,
        description: 'description',
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        cvc: '123',
        number: '4111111111111111',
        exp_month: '1',
        exp_year: null
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-exp_year')
    })

    it('should require token for Stripe JS 2', async () => {
      global.stripeJS = 2
      const user = await TestHelper.createUser()
      await SubscriptionsTestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/application-server/create-card?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        email: user.profile.email,
        description: 'description',
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        token: null
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-token')
    })

    it('should require token for Stripe JS 3', async () => {
      global.stripeJS = 3
      const user = await TestHelper.createUser()
      await SubscriptionsTestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/application-server/create-card?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        email: user.profile.email,
        description: 'description',
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        token: null
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-token')
    })
    
    it('should create card', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      await SubscriptionsTestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/application-server/create-card?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        name: 'Test person',
        cvc: '111',
        number: '4111-1111-1111-1111',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString(),
        address_line1: 'A street address',
        address_city: 'City',
        address_state: 'California',
        address_zip: '90120',
        address_country: 'US'
      }
      const card = await req.route.api.post(req)
      assert.strictEqual(card.object, 'card')
    })

    it('should update as customer\'s default card', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      await SubscriptionsTestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/application-server/create-card?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        name: 'Test person',
        cvc: '111',
        number: '4111-1111-1111-1111',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString(),
        address_line1: 'A street address',
        address_city: 'City',
        address_state: 'California',
        address_zip: '90120',
        address_country: 'US'
      }
      const card = await req.route.api.post(req)
      const req2 = TestHelper.createRequest(`/api/administrator/subscriptions/customer?customerid=${user.customer.id}`)
      const customerNow = await req2.route.api._get(req2)
      assert.strictEqual(card.id, customerNow.default_source)
    })
  })
})
