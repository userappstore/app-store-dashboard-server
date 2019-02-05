/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/application-server/create-user', () => {
  describe('CreateUser#POST', () => {
    it('should restrict access to application server', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/application-server/create-user?serverid=xxx`)
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-access')
    })

    it('should require a serverid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/application-server/create-user?serverid=`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-application-serverid')
    })

    it('should reject missing first name', async () => {
      const owner = await TestHelper.createOwner()
      let project = await TestHelper.createProject(owner)
      project = await TestHelper.shareProject(owner, project.projectid)
      const user = await TestHelper.createUser()
      await TestHelper.installProject(user, project.projectid)
      const req = TestHelper.createRequest(`/api/application-server/create-user?serverid=${user.install.serverid}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
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
      assert.strictEqual(errorMessage, 'invalid-profile-first-name')
    })

    it('should enforce first name length', async () => {
      const owner = await TestHelper.createOwner()
      let project = await TestHelper.createProject(owner)
      project = await TestHelper.shareProject(owner, project.projectid)
      const user = await TestHelper.createUser()
      await TestHelper.installProject(user, project.projectid)
      const req = TestHelper.createRequest(`/api/application-server/create-user?serverid=${user.install.serverid}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        ['first-name']: '1',
        ['last-name']: 'Test',
        email: 'test@email.com'
      }
      global.minimumProfileFirstNameLength = 10
      global.maximumProfileFirstNameLength = 100
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profile-first-name-length')
      global.minimumProfileFirstNameLength = 1
      global.maximumProfileFirstNameLength = 1
      req.body = {
        ['first-name']: '123456789',
        ['last-name']: 'Test',
        email: 'test@email.com'
      }
      errorMessage = null
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profile-first-name-length')
    })

    it('should reject missing last name', async () => {
      const user = await TestHelper.createUser()
      let project = await TestHelper.createProject(user)
      project = await TestHelper.shareProject(user, project.projectid)
      await TestHelper.installProject(user, project.projectid)
      const req = TestHelper.createRequest(`/api/application-server/create-user?serverid=${user.install.serverid}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        ['first-name']: 'Test',
        ['last-name']: null,
        email: 'test@email.com'
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profile-last-name')
    })

    it('should enforce last name length', async () => {
      const owner = await TestHelper.createOwner()
      let project = await TestHelper.createProject(owner)
      project = await TestHelper.shareProject(owner, project.projectid)
      const user = await TestHelper.createUser()
      await TestHelper.installProject(user, project.projectid)
      const req = TestHelper.createRequest(`/api/application-server/create-user?serverid=${user.install.serverid}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        ['first-name']: 'Test',
        ['last-name']: '1',
        email: 'test@email.com'
      }
      global.minimumProfileLastNameLength = 10
      global.maximumProfileLastNameLength = 100
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profile-last-name-length')
      global.minimumProfileLastNameLength = 1
      global.maximumProfileLastNameLength = 1
      req.body = {
        ['first-name']: 'Test',
        ['last-name']: '123456789',
        email: 'test@email.com'
      }
      errorMessage = null
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profile-last-name-length')
    })

    it('should reject missing email', async () => {
      const owner = await TestHelper.createOwner()
      let project = await TestHelper.createProject(owner)
      project = await TestHelper.shareProject(owner, project.projectid)
      const user = await TestHelper.createUser()
      await TestHelper.installProject(user, project.projectid)
      const req = TestHelper.createRequest(`/api/application-server/create-user?serverid=${user.install.serverid}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        ['first-name']: 'Test',
        ['last-name']: 'Test',
        email: null
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profile-email')
    })

    it('should create user account without owner/administrator permission', async () => {
      const owner = await TestHelper.createOwner()
      let project = await TestHelper.createProject(owner)
      project = await TestHelper.shareProject(owner, project.projectid)
      const user = await TestHelper.createUser()
      await TestHelper.installProject(user, project.projectid)
      const req = TestHelper.createRequest(`/api/application-server/create-user?serverid=${user.install.serverid}`)
      req.account = user.account
      req.session = user.session
      req.applicationServer = true
      req.body = {
        email: user.profile.email,
        ['first-name']: user.profile.firstName,
        ['last-name']: user.profile.lastName
      }
      const account = await req.route.api.post(req)
      assert.strictEqual(account.object, 'account')
      assert.strictEqual(account.owner, undefined)
      assert.strictEqual(account.administrator, undefined)
      assert.notStrictEqual(user.account.accountid, account.accountid)
    })
  })
})
