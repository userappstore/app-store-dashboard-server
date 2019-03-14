/* eslint-env mocha */
const assert = require('assert')
const Handler = require('./skip-urls-from-within-templates.js')
const TestHelper = require('../../test-helper.js')

describe('server/skip-urls-from-within-templates', () => {
  describe('SkipURLsFromWithinTemplates#before', () => {
    it('should end response', async () => {
      const req = TestHelper.createRequest(`/install/test/${encodeURI('${account.accountid}')}`)
      const res = { end: () => { } }
      await Handler.before(req, res) 
      assert.strictEqual(res.ended, true)
    })    
    
    it('should ignore request', async () => {
      const req = TestHelper.createRequest(`/install/test/`)
      const res = { end: () => { } }
      await Handler.before(req, res)
      assert.strictEqual(res.ended, undefined)
    })
  })
})
