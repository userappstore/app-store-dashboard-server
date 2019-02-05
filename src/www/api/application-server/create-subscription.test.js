/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const SubscriptionsTestHelper = require('@userappstore/stripe-subscriptions/test-helper.js')

describe(`/api/application-server/create-subscription`, () => {
  describe('CreateSubscription#POST', () => {
    it('should restrict access to the application server', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/application-server/create-subscription?customerid=xxx`)
      req.account = user.account
      req.session = user.session
      req.body = {
        ['first-name']: null,
        ['last-name']: 'Test',
        email: 'test@email.com'
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-access')
    })

    it('should reject invalid planid', async () => {
      const user = await TestHelper.createUser()
      await SubscriptionsTestHelper.createCustomer(user)
      await SubscriptionsTestHelper.createCard(user)
      const req = TestHelper.createRequest(`/api/application-server/create-subscription?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        planid: 'invalid'
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-planid')
    })

    it('should reject never-published planid', async () => {
      const administrator = await TestHelper.createOwner()
      const product = await SubscriptionsTestHelper.createProduct(administrator, { published: true })
      await SubscriptionsTestHelper.createPlan(administrator, { productid: product.id })
      const user = await TestHelper.createUser()
      await SubscriptionsTestHelper.createCustomer(user)
      await SubscriptionsTestHelper.createCard(user)
      const req = TestHelper.createRequest(`/api/application-server/create-subscription?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        planid: administrator.plan.id
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-plan')
    })

    it('should reject unpublished plan', async () => {
      const administrator = await TestHelper.createOwner()
      const product = await SubscriptionsTestHelper.createProduct(administrator, { published: true })
      const plan = await SubscriptionsTestHelper.createPlan(administrator, { productid: product.id, published: true, unpublished: true })
      const user = await TestHelper.createUser()
      await SubscriptionsTestHelper.createCustomer(user)
      await SubscriptionsTestHelper.createCard(user)
      const req = TestHelper.createRequest(`/api/application-server/create-subscription?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        planid: plan.id
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-plan')
    })

    it('should reject customer without card', async () => {
      const administrator = await TestHelper.createOwner()
      const product = await SubscriptionsTestHelper.createProduct(administrator, { published: true })
      await SubscriptionsTestHelper.createPlan(administrator, { productid: product.id, published: true, trial_period_days: 0, amount: 1000 })
      const user = await TestHelper.createUser()
      await SubscriptionsTestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/application-server/create-subscription?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        planid: administrator.plan.id
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-cardid')
    })

    it('should allow customer without card on free plan', async () => {
      const administrator = await TestHelper.createOwner()
      const product = await SubscriptionsTestHelper.createProduct(administrator, { published: true })
      await SubscriptionsTestHelper.createPlan(administrator, { productid: product.id, published: true, trial_period_days: 0, amount: 0 })
      const user = await TestHelper.createUser()
      await SubscriptionsTestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/application-server/create-subscription?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        planid: administrator.plan.id
      }
      const subscription = await req.route.api.post(req)
      assert.strictEqual(subscription.object, 'subscription')
    })

    it('should create authorized subscription', async () => {
      const administrator = await TestHelper.createOwner()
      const product = await SubscriptionsTestHelper.createProduct(administrator, { published: true })
      await SubscriptionsTestHelper.createPlan(administrator, { productid: product.id, published: true })
      const user = await TestHelper.createUser()
      await SubscriptionsTestHelper.createCustomer(user)
      await SubscriptionsTestHelper.createCard(user)
      const req = TestHelper.createRequest(`/api/application-server/create-subscription?customerid=${user.customer.id}&`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        planid: administrator.plan.id
      }
      const subscription = await req.route.api.post(req)
      assert.strictEqual(subscription.object, 'subscription')
    })
  })
})
