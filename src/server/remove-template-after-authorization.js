module.exports = {
  after: (req) => {
    if (req.query && req.query.removeTemplate) {
      console.log('removing template', req.query, req.session.unlocked)
      const routeWas = req.route
      req.route = {}
      for (const key in routeWas) {
        req.route[key] = routeWas[key]
      }
      req.route.template = false
    }
  }
}