/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const ConnectTestHelper = require('@userdashboard/stripe-connect/test-helper.js')

describe('/api/application-server/stripe-account', () => {
  describe('StripeAccount#GET', () => {
    it('should restrict access to the application server', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/application-server/stripe-account?stripeid=invalid`)
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-access')
    })

    it('should reject invalid stripeid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/application-server/stripe-account?stripeid=invalid`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      let errorMessage
      try {
        await req.route.api.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-stripeid')
    })

    it('should return Stripe account data', async () => {
      const user = await TestHelper.createUser()
      await ConnectTestHelper.createStripeAccount(user, { type: 'company', country: 'US' })
      await ConnectTestHelper.createStripeRegistration(user, { business_tax_id: 1, business_name: user.profile.firstName + '\'s company', country: 'US', city: 'New York City', personal_city: 'New York City', postal_code: '10001', personal_id_number: '000000000', line1: 'First Street', day: '1', month: '1', year: '1950', company_city: 'New York City', company_state: 'New York', company_line1: 'First Street', company_postal_code: '10001', ssn_last_4: '0000' })
      const req = TestHelper.createRequest(`/api/application-server/stripe-account?stripeid=${user.stripeAccount.id}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      const stripeAccount = await req.route.api.get(req)
      assert.strictEqual(stripeAccount.id, user.stripeAccount.id)
    })
  })
})
