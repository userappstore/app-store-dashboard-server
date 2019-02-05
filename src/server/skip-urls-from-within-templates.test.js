/* eslint-env mocha */
const assert = require('assert')
const Handler = require('./skip-urls-from-within-templates.js')
const TestHelper = require('../../test-helper.js')

describe('server/skip-urls-from-within-templates', () => {
  describe('SkipURLsFromWithinTemplates#before', () => {
    it('should return an empty response', async () => {
      const req = TestHelper.createRequest(`/install/test/${encodeURI('${account.accountid}')}`)
      req.headers = {}
      let result, errorMessage
      try {
        result = await req.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(result, undefined)
      assert.strictEqual(errorMessage, undefined)
    })
  })
})
