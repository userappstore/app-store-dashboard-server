const createCard = require('@userappstore/stripe-subscriptions/src/www/api/user/subscriptions/create-card.js')
createCard.lock = false

module.exports = {
  post: async (req) => {
    if (!req.applicationServer) {
      throw new Error('invalid-access')
    }
    return createCard.post(req)
  }
}
